/**
 * Fetches world countries from a public API and maps them to the dashboard
 * `ICountry` shape: `name`, `abbr` (ISO 3166-1 alpha-2), `icon` (flag emoji).
 *
 * @see https://restcountries.com/
 */

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2,flag'

type RestCountry = {
    name?: { common?: string }
    cca2?: string
    flag?: string
}

export type CountrySyncRow = {
    name: string
    abbr: string
    icon: string
}

export type CountrySyncPayload = {
    countries: CountrySyncRow[]
}

/** Unicode regional indicator symbols A–Z → flag emoji for a 2-letter ISO code. */
function flagEmojiFromAlpha2(code: string): string {
    const upper = code.trim().toUpperCase()
    if (upper.length !== 2) {
        return '🏳️'
    }
    const base = 0x1f1e6
    const cp = (ch: string) => base + (ch.charCodeAt(0) - 65)
    return String.fromCodePoint(cp(upper[0]!), cp(upper[1]!))
}

function toSyncRow(c: RestCountry): CountrySyncRow | null {
    const common = c.name?.common?.trim()
    const rawAbbr = c.cca2?.trim().toUpperCase()
    if (!common || !rawAbbr || rawAbbr.length !== 2) {
        return null
    }
    const flag = typeof c.flag === 'string' && c.flag.trim() ? c.flag.trim() : flagEmojiFromAlpha2(rawAbbr)
    return {
        name: common,
        abbr: rawAbbr,
        icon: flag
    }
}

/**
 * Calls REST Countries, transforms each entry to `{ name, abbr, icon }`, dedupes by `abbr`,
 * and sorts by common name.
 */
export async function fetchCountriesSyncPayload(): Promise<CountrySyncPayload> {
    const res = await fetch(REST_COUNTRIES_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(45_000)
    })
    if (!res.ok) {
        throw new Error(`REST Countries HTTP ${res.status}`)
    }
    const data = (await res.json()) as RestCountry[]
    if (!Array.isArray(data)) {
        throw new Error('REST Countries: expected JSON array')
    }

    const byAbbr = new Map<string, CountrySyncRow>()
    for (const item of data) {
        const row = toSyncRow(item)
        if (row) {
            byAbbr.set(row.abbr, row)
        }
    }

    const countries = [...byAbbr.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'))
    return { countries }
}
