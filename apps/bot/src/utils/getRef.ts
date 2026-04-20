import YAML from 'yaml'

function extractYaml(snapshot: string) {
    const match = snapshot.match(/```yaml([\s\S]*?)```/)
    const result = match ? match[1] : null
    // console.log(result)
    return result
}

function parseSnapshot(snapshotText: string) {
    const yamlText = extractYaml(snapshotText)
    if (!yamlText) return null

    const result = YAML.parse(yamlText) as unknown
    // console.log(result)
    // writeFile('yaml.json', JSON.stringify(result, null, 2), () => {})

    return result
}

export function findRef(tree: unknown, query: string): string | null {
    const q = query.toLowerCase()

    function walk(node: unknown): string | null {
        if (!node) return null

        if (typeof node === 'string') {
            const labelMatch = node.match(/"(.*?)"/)
            const refMatch = node.match(/\[ref=(.*?)\]/)

            if (labelMatch && refMatch) {
                const label = labelMatch[1].toLowerCase()

                if (label === q) {
                    return refMatch[1]
                }
            }

            return null
        }

        if (Array.isArray(node)) {
            for (const item of node) {
                const result = walk(item)
                if (result) return result
            }
            return null
        }

        if (typeof node === 'object') {
            for (const [key, value] of Object.entries(node)) {
                const labelMatch = key.match(/"(.*?)"/)
                const refMatch = key.match(/\[ref=(.*?)\]/)

                if (labelMatch && refMatch) {
                    const label = labelMatch[1].toLowerCase()

                    if (label === q) {
                        return refMatch[1]
                    }
                }

                const result = walk(value)
                if (result) return result
            }
        }

        return null
    }

    return walk(tree)
}

export function getRef(snapshotText: string, query: string) {
    const parsed = parseSnapshot(snapshotText)
    if (!parsed) return null

    return findRef(parsed, query)
}
