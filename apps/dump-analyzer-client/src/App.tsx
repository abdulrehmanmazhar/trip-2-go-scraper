import { useState } from 'react'

type FileItem = {
    id: string
    name: string
}
const styles: Record<string, React.CSSProperties> = {
    app: {
        height: '100vh',
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

export default function App() {
    // dummy placeholders — YOU will replace logic
    const [search, setSearch] = useState('')
    const [selectedFile, setSelectedFile] = useState<string | null>(null)

    const files: FileItem[] = [
        { id: '1', name: 'abc123_request.json' },
        { id: '2', name: 'abc123_response.json' },
        { id: '3', name: 'xyz456_request.json' },
        { id: '4', name: 'xyz456_response.json' }
    ]

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

                <select style={styles.select}>
                    <option>All</option>
                    <option>Requests</option>
                    <option>Responses</option>
                </select>

                <button style={styles.button}>◀ Prev</button>
                <button style={styles.button}>Next ▶</button>
            </div>

            {/* FILE LIST */}
            <div style={styles.fileList}>
                {files.map((file) => (
                    <div
                        key={file.id}
                        onClick={() => setSelectedFile(file.id)}
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
                    <pre style={styles.code}>
                        {`{
  "method": "GET",
  "url": "/api/example",
  "headers": {}
}`}
                    </pre>
                </div>

                <div style={styles.panel}>
                    <div style={styles.panelHeader}>Response</div>
                    <pre style={styles.code}>
                        {`{
  "status": 200,
  "body": { "ok": true }
}`}
                    </pre>
                </div>
            </div>
        </div>
    )
}
