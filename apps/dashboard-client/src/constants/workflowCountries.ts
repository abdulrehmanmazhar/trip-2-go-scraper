/**
 * Mirrors `ICountry` in dashboard-backend (`name`, `abbr`, `icon`) for client UI until the countries API is wired.
 * `abbr` is ISO 3166-1 alpha-2 for `react-country-flag`.
 */
export type WorkflowCountry = {
    _id: string
    name: string
    abbr: string
    icon: string
}

export const WORKFLOW_COUNTRIES: WorkflowCountry[] = [
    { _id: 'country_pk', name: 'Pakistan', abbr: 'PK', icon: '🇵🇰' },
    { _id: 'country_it', name: 'Italy', abbr: 'IT', icon: '🇮🇹' },
    { _id: 'country_de', name: 'Germany', abbr: 'DE', icon: '🇩🇪' },
    { _id: 'country_fr', name: 'France', abbr: 'FR', icon: '🇫🇷' },
    { _id: 'country_ae', name: 'UAE', abbr: 'AE', icon: '🇦🇪' },
    { _id: 'country_es', name: 'Spain', abbr: 'ES', icon: '🇪🇸' },
    { _id: 'country_tr', name: 'Turkey', abbr: 'TR', icon: '🇹🇷' },
    { _id: 'country_gb', name: 'United Kingdom', abbr: 'GB', icon: '🇬🇧' },
    { _id: 'country_us', name: 'United States', abbr: 'US', icon: '🇺🇸' }
]

export function getWorkflowCountryById(id: string): WorkflowCountry | undefined {
    return WORKFLOW_COUNTRIES.find((c) => c._id === id)
}
