import constants, { APIS } from '@/constants'

const apiRoot = `${constants.BACKEND_LINK}${constants.API_VERSION}`

export type CountryOption = { _id: string; name: string; abbr: string; icon: string }

export type WorkflowRecord = {
    id: string
    name: string
    description: string
    thumbnail?: string
    createdAt: string
    applicationCountry: CountryOption
    destinationCountry: CountryOption
}

export type WorkflowListData = {
    items: WorkflowRecord[]
    page: number
    limit: number
    total: number
    totalPages: number
}

async function parseJsonError(res: Response): Promise<string> {
    try {
        const txt = await res.text()
        try {
            const json = JSON.parse(txt) as { message?: string }
            return json.message || 'Request failed'
        } catch {
            return txt.slice(0, 200) || 'Request failed'
        }
    } catch {
        return 'Request failed'
    }
}

export async function fetchCountries(): Promise<CountryOption[]> {
    const res = await fetch(`${apiRoot}${APIS.COUNTRIES}`, { credentials: 'include' })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: CountryOption[] }
    return json.data ?? []
}

export async function fetchWorkflowsPage(params: { page: number; limit: number; search: string }): Promise<WorkflowListData> {
    const q = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit)
    })
    if (params.search.trim()) {
        q.set('search', params.search.trim())
    }
    const res = await fetch(`${apiRoot}${APIS.WORKFLOWS}?${q}`, { credentials: 'include' })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: WorkflowListData }
    const data = json.data
    if (!data) {
        throw new Error('Invalid response')
    }
    return data
}

export async function postWorkflow(form: FormData): Promise<WorkflowRecord> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOWS}`, {
        method: 'POST',
        credentials: 'include',
        body: form
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: WorkflowRecord }
    if (!json.data) {
        throw new Error('Invalid response')
    }
    return json.data
}

export async function postImportWorkflow(form: FormData): Promise<WorkflowRecord> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOWS_IMPORT}`, {
        method: 'POST',
        credentials: 'include',
        body: form
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: WorkflowRecord }
    if (!json.data) {
        throw new Error('Invalid response')
    }
    return json.data
}

export async function patchWorkflow(workflowId: string, form: FormData): Promise<WorkflowRecord> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOWS}/${encodeURIComponent(workflowId)}`, {
        method: 'PATCH',
        credentials: 'include',
        body: form
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: WorkflowRecord }
    if (!json.data) {
        throw new Error('Invalid response')
    }
    return json.data
}

export async function deleteWorkflowRecord(workflowId: string): Promise<void> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOWS}/${encodeURIComponent(workflowId)}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
}

export async function downloadWorkflowExport(workflowId: string, fallbackName: string): Promise<void> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOWS}/${encodeURIComponent(workflowId)}/export`, { credentials: 'include' })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const blob = await res.blob()
    let filename = `${fallbackName.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'workflow'}.workflow`
    const cd = res.headers.get('Content-Disposition')
    if (cd) {
        const m = /filename="?([^";]+)"?/i.exec(cd)
        if (m?.[1]) {
            filename = m[1]
        }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
