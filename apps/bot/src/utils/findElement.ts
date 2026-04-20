type UIElement = {
    role: string
    label?: string
    ref: string
}

export function findElement(elements: UIElement[], query: { role?: string; label?: string }) {
    return elements.find((el) => {
        if (query.role && el.role !== query.role) return false

        if (query.label && el.label !== query.label) return false

        return true
    })
}
