export async function getUserMails(
    accessToken: string,
    options?: {
        maxResults?: number
        pageToken?: string
        query?: string
    }
) {
    const params = new URLSearchParams()

    if (options?.maxResults) {
        params.append('maxResults', String(options.maxResults))
    }

    if (options?.pageToken) {
        params.append('pageToken', options.pageToken)
    }

    if (options?.query) {
        params.append('q', options.query)
    }

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!res.ok) {
        const error = await res.text()
        throw new Error(`Failed to fetch emails: ${error}`)
    }

    return res.json() as unknown
}

function decodeBase64Url(data: string) {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    const buff = Buffer.from(base64, 'base64')
    return buff.toString('utf-8')
}

function extractBody(payload: any): string {
    if (!payload) return ''

    // If message has direct body
    if (payload.body?.data) {
        return decodeBase64Url(payload.body.data)
    }

    // If multipart, search recursively
    if (payload.parts && payload.parts.length) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                return decodeBase64Url(part.body.data)
            }

            if (part.parts) {
                const nested = extractBody(part)
                if (nested) return nested
            }
        }
    }

    return ''
}

function getHeader(headers: any[], name: string) {
    return headers.find((h) => h.name === name)?.value || ''
}

export async function getUserMailsWithContent(
    accessToken: string,
    options?: {
        maxResults?: number
        pageToken?: string
        query?: string
    }
) {
    const params = new URLSearchParams()

    params.append('maxResults', String(options?.maxResults ?? 10))

    if (options?.pageToken) {
        params.append('pageToken', options.pageToken)
    }

    if (options?.query) {
        params.append('q', options.query)
    }

    // 1️⃣ Get message IDs
    const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!listRes.ok) {
        throw new Error(await listRes.text())
    }

    const listData = await listRes.json()

    if (!listData.messages) {
        return []
    }

    // 2️⃣ Fetch full message details
    const messages = await Promise.all(
        listData.messages.map(async (msg: { id: string }) => {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            if (!detailRes.ok) return null

            const detail = await detailRes.json()

            const headers = detail.payload.headers

            return {
                id: detail.id,
                threadId: detail.threadId,
                snippet: detail.snippet,
                subject: getHeader(headers, 'Subject'),
                from: getHeader(headers, 'From'),
                to: getHeader(headers, 'To'),
                date: getHeader(headers, 'Date'),
                body: extractBody(detail.payload)
            }
        })
    )

    return messages.filter(Boolean)
}
