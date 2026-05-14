import CountryModel from '../model/country.model.js'

export type CountrySyncInput = {
    name: string
    abbr: string
    icon: string
}

export type UpdateCountryListPayload = {
    countries: CountrySyncInput[]
}

export type UpdateCountryListResult = {
    created: number
    updated: number
    skipped: number
    errors: string[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function normalizeAbbr(abbr: string): string {
    return abbr.trim().toUpperCase()
}

function dedupeByAbbr(rows: CountrySyncInput[]): CountrySyncInput[] {
    const map = new Map<string, CountrySyncInput>()
    for (const row of rows) {
        const key = normalizeAbbr(row.abbr)
        map.set(key, { ...row, abbr: key, name: row.name.trim(), icon: row.icon.trim() })
    }
    return [...map.values()]
}

function validateRow(raw: unknown): CountrySyncInput | null {
    if (!isRecord(raw)) {
        return null
    }
    const { name, abbr, icon } = raw
    if (typeof name !== 'string' || !name.trim()) {
        return null
    }
    if (typeof abbr !== 'string' || !abbr.trim()) {
        return null
    }
    if (typeof icon !== 'string' || !icon.trim()) {
        return null
    }
    const nAbbr = normalizeAbbr(abbr)
    if (nAbbr.length < 2) {
        return null
    }
    return { name: name.trim(), abbr: nAbbr, icon: icon.trim() }
}

function extractCountryRows(payload: unknown): CountrySyncInput[] | null {
    let list: unknown[]
    if (Array.isArray(payload)) {
        list = payload
    } else if (isRecord(payload) && Array.isArray(payload.countries)) {
        list = payload.countries
    } else {
        return null
    }

    const out: CountrySyncInput[] = []
    for (let i = 0; i < list.length; i++) {
        const row = validateRow(list[i])
        if (row) {
            out.push(row)
        }
    }
    return out
}

/**
 * Upserts countries from the payload: match by `abbr` (case-insensitive, stored uppercase).
 * Existing rows are updated; missing rows are created. Nothing is deleted.
 * Incoming duplicates by `abbr` are collapsed to a single entry (last wins).
 * Rows that would violate unique `icon` against a different country are skipped with an error message.
 */
export async function updateCountryList(payload: unknown): Promise<UpdateCountryListResult> {
    const extracted = extractCountryRows(payload)
    if (extracted === null) {
        throw new Error('Invalid payload: expected { countries: [...] } or a bare array of { name, abbr, icon }')
    }

    const rows = dedupeByAbbr(extracted)
    const result: UpdateCountryListResult = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: []
    }

    for (const row of rows) {
        const existingByAbbr = await CountryModel.findOne({ abbr: row.abbr }).exec()

        const iconOwnerElsewhere = await CountryModel.findOne({
            icon: row.icon,
            abbr: { $ne: row.abbr }
        }).exec()

        if (iconOwnerElsewhere) {
            result.skipped += 1
            result.errors.push(`Skipped ${row.abbr}: icon already used by country with abbr ${iconOwnerElsewhere.abbr}`)
            continue
        }

        if (existingByAbbr) {
            const sameName = existingByAbbr.name === row.name
            const sameIcon = existingByAbbr.icon === row.icon
            if (sameName && sameIcon) {
                continue
            }
            existingByAbbr.name = row.name
            existingByAbbr.icon = row.icon
            await existingByAbbr.save()
            result.updated += 1
            continue
        }

        try {
            await CountryModel.create({
                name: row.name,
                abbr: row.abbr,
                icon: row.icon
            })
            result.created += 1
        } catch (e) {
            result.skipped += 1
            const msg = e instanceof Error ? e.message : String(e)
            result.errors.push(`Skipped ${row.abbr}: ${msg}`)
        }
    }

    return result
}
