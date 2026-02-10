import { useEffect, useState } from 'react'

type FileItem = {
    id: string
    name: string
}

type FilterRequestInterface = {
    search: string
    index: number
    type: 'all' | 'req' | 'res'
    timestampSort: boolean
}

type FilterResponseInterface = {
    data: {
        files: string[]
    }
}
const styles: Record<string, React.CSSProperties> = {
    app: {
        // height: '100vh',
        background: '#0f1115',
        color: '#e6e6e6',
        fontFamily: 'system-ui, monospace',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
    },

    topBar: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
    },

    search: {
        flex: 1,
        padding: '6px 8px',
        background: '#1b1f27',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: 4
    },

    select: {
        background: '#1b1f27',
        color: '#fff',
        border: '1px solid #333',
        padding: 6,
        borderRadius: 4
    },

    button: {
        background: '#1b1f27',
        color: '#fff',
        border: '1px solid #333',
        padding: '6px 10px',
        borderRadius: 4,
        cursor: 'pointer'
    },

    fileList: {
        height: 120,
        overflowY: 'auto',
        border: '1px solid #333',
        borderRadius: 4,
        background: '#0c0e12'
    },

    fileItem: {
        padding: '6px 8px',
        cursor: 'pointer',
        borderBottom: '1px solid #222'
    },

    fileItemActive: {
        background: '#1f2533'
    },

    panels: {
        flex: 1,
        display: 'flex',
        gap: 10
    },

    panel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #333',
        borderRadius: 4,
        overflow: 'hidden'
    },

    panelHeader: {
        padding: '6px 8px',
        background: '#1b1f27',
        borderBottom: '1px solid #333',
        fontWeight: 600
    },

    code: {
        flex: 1,
        margin: 0,
        padding: 10,
        background: '#0c0e12',
        overflow: 'auto',
        fontSize: 12,
        lineHeight: 1.4
    }
}

const getJson = async (file: string) => {
    const response = await fetch('http://localhost:3000/api/v1/get_json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file })
    })
    return await response.json()
}

const filterDump = async (url: string, filters: FilterRequestInterface): Promise<FilterResponseInterface> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
    })

    return (await response.json()) as FilterResponseInterface
}

export default function App() {
    // dummy placeholders — YOU will replace logic
    const [search, setSearch] = useState('')
    const [index, setIndex] = useState(0)
    const [type, setType] = useState<FilterRequestInterface['type']>('all' as const)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [timestampSort, setTimestampSort] = useState(false)

    const [loading, setLoading] = useState(false)

    const [files, setFiles] = useState<FileItem[]>([])

    const [response, setResponse] = useState('')
    const [request, setRequest] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true)
            filterDump('http://localhost:3000/api/v1/filter_dump', {
                search,
                index,
                type,
                timestampSort
            }).then((r) => {
                setFiles(
                    r.data.files.map((filePath) => ({
                        id: filePath,
                        name: filePath.split('\\').pop()!
                    }))
                )
                setLoading(false)
            })
        }, 2000) // ⏱ debounce delay

        return () => {
            clearTimeout(timer) // cancel previous call
        }
    }, [search, type, timestampSort])

    const xyz = async (filepath: string) => {
        setSelectedFile(filepath)
        const response = await getJson(filepath)
        if (filepath.includes('response')) {
            setResponse(response.data)
            setRequest('')
        } else if (filepath.includes('request')) {
            setRequest(response.data)
            setResponse('')
        }
    }
    return (
        <div style={styles.app}>
            {/* TOP BAR */}
            <div style={styles.topBar}>
                <input
                    placeholder="Search anything..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.search}
                />
                <select
                    style={styles.select}
                    value={type}
                    onChange={(e) => setType(e.target.value as FilterRequestInterface['type'])}>
                    <option value="all">All</option>
                    <option value="req">Requests</option>
                    <option value="res">Responses</option>
                </select>
                <button
                    style={styles.button}
                    onClick={() => {
                        setIndex((prev) => {
                            const newIndex = Math.max(prev - 1, 0) // prevent negative
                            xyz(files[newIndex]?.id || '') // use newIndex, not prev
                            return newIndex
                        })
                    }}>
                    ◀ Prev
                </button>
                <input
                    type="number"
                    name=""
                    id=""
                    onChange={(e) => {
                        const number = Number(e.target.value)
                        if (typeof number !== 'number') return
                        setIndex(() => {
                            const newIndex = Math.max(number - 1, 0) // prevent negative
                            xyz(files[newIndex]?.id || '') // use newIndex, not prev
                            return newIndex
                        })
                    }}
                />
                <div>{index + 1}</div> {/* +1 so user sees 1-based index */}
                <button
                    style={styles.button}
                    onClick={() => {
                        setIndex((prev) => {
                            const newIndex = Math.min(prev + 1, files.length - 1) // prevent overflow
                            xyz(files[newIndex]?.id || '')
                            return newIndex
                        })
                    }}>
                    Next ▶
                </button>
                <button
                    style={styles.button}
                    onClick={() => setTimestampSort(!timestampSort)}>
                    {timestampSort ? 'Sort Desc' : 'Sort Asc'}
                </button>
                <div>{files.length}</div>
                {loading && <div>Loading...</div>}
            </div>

            {/* FILE LIST */}
            <div style={styles.fileList}>
                {files.map((file) => (
                    <div
                        key={file.id}
                        onClick={async () => {
                            setSelectedFile(file.id)
                            const response = await getJson(file.id)
                            if (file.id.includes('response')) {
                                setResponse(response.data)
                                setRequest('')
                            } else if (file.id.includes('request')) {
                                setRequest(response.data)
                                setResponse('')
                            }
                        }}
                        style={{
                            ...styles.fileItem,
                            ...(selectedFile === file.id ? styles.fileItemActive : {})
                        }}>
                        {file.name}
                    </div>
                ))}
            </div>

            {/* REQUEST / RESPONSE VIEW */}
            <div style={styles.panels}>
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>Request</div>
                    <pre style={styles.code}>{request}</pre>
                </div>

                <div style={styles.panel}>
                    <div style={styles.panelHeader}>Response</div>
                    <pre style={styles.code}>{response}</pre>
                </div>
            </div>
        </div>
    )
}
