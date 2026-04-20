function extractYaml(text: string) {
    const match = text.match(/```yaml([\s\S]*?)```/)
    return match ? match[1] : ''
}

type UIElement = {
    role: string
    label?: string
    ref: string
}

export function buildElementIndex(snapshot: string): UIElement[] {
    const yaml = extractYaml(snapshot) as string

    const elements: UIElement[] = []

    const regex = /^\s*-\s*([a-zA-Z]+)(?:\s+"([^"]+)")?.*?\[ref=(.*?)\]/gm

    let match

    while ((match = regex.exec(yaml)) !== null) {
        const role = match[1]!
        const label = match[2]!
        const ref = match[3]!

        elements.push({
            role,
            label,
            ref
        })
    }

    return elements
}
