import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import Header from '@/components/features/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EditIcon, Plus, Search, Play, MoreVertical, Trash2, Download, ExternalLink, ImageIcon, X, Upload, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'
import { WORKFLOW_COUNTRIES, type WorkflowCountry } from '@/constants/workflowCountries'
import { cn } from '@/lib/utils'

type WorkflowItem = {
    id: string
    name: string
    description: string
    createdAt: string
    thumbnail?: string
    applicationCountry: WorkflowCountry
    destinationCountry: WorkflowCountry
}

/** Placeholder list until workflows are loaded from the API */
const SAMPLE_WORKFLOWS: WorkflowItem[] = [
    {
        id: '1',
        name: 'Checkout flow',
        description: 'E-commerce checkout automation.',
        createdAt: '2026-04-12',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
        applicationCountry: WORKFLOW_COUNTRIES.find((c) => c._id === 'country_pk')!,
        destinationCountry: WORKFLOW_COUNTRIES.find((c) => c._id === 'country_it')!
    },
    {
        id: '2',
        name: 'Login & profile',
        description: 'Sign-in and profile navigation.',
        createdAt: '2026-04-28',
        applicationCountry: WORKFLOW_COUNTRIES.find((c) => c._id === 'country_de')!,
        destinationCountry: WORKFLOW_COUNTRIES.find((c) => c._id === 'country_fr')!
    },
    {
        id: '3',
        name: 'Invoice export',
        description: 'Reports and CSV export steps.',
        createdAt: '2026-05-01',
        applicationCountry: WORKFLOW_COUNTRIES.find((c) => c._id === 'country_ae')!,
        destinationCountry: WORKFLOW_COUNTRIES.find((c) => c._id === 'country_de')!
    }
]

const emptyWorkflowForm = () => ({
    thumbnail: '',
    name: '',
    description: '',
    applicationCountryId: '',
    destinationCountryId: ''
})

function validateThumbnailUrl(url: string) {
    if (!url) return true
    try {
        const parsedUrl = new URL(url)
        return parsedUrl.protocol === 'https:' && url.match(/\.(jpeg|jpg|gif|png|webp)/i) !== null
    } catch {
        return false
    }
}

function CountryRowButton({ country, selected, onSelect }: { country: WorkflowCountry; selected: boolean; onSelect: (id: string) => void }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(country._id)}
            className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/70',
                selected && 'bg-muted'
            )}>
            <ReactCountryFlag
                countryCode={country.abbr}
                svg
                style={{ width: '1.25rem', height: '1.25rem' }}
            />
            <span className="min-w-0 flex-1 font-medium">{country.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{country.abbr}</span>
        </button>
    )
}

function CountryListField({ label, valueId, onChange }: { label: string; valueId: string; onChange: (id: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="max-h-44 overflow-y-auto rounded-md border border-border/60 divide-y divide-border/60 bg-background">
                {WORKFLOW_COUNTRIES.map((c) => (
                    <CountryRowButton
                        key={c._id}
                        country={c}
                        selected={valueId === c._id}
                        onSelect={onChange}
                    />
                ))}
            </div>
        </div>
    )
}

function WorkflowCard({ workflow: w, onEdit }: { workflow: WorkflowItem; onEdit: (workflow: WorkflowItem) => void }) {
    const [thumbError, setThumbError] = useState(false)
    const hasThumb = Boolean(w.thumbnail) && !thumbError

    return (
        <Card className="group h-full rounded-xl overflow-hidden border border-border/60 bg-background shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
            <div className="relative h-32 flex items-center justify-between px-4 border-b overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                {hasThumb ? (
                    <>
                        <img
                            src={w.thumbnail}
                            alt={w.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={() => setThumbError(true)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-full flex items-center justify-between relative z-10">
                            <div className="text-sm font-semibold">WF</div>
                            <Badge
                                variant="secondary"
                                className="text-xs">
                                {w.createdAt}
                            </Badge>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Play className="w-20 h-20 text-foreground/5" />
                        </div>
                    </>
                )}
            </div>

            <CardHeader className="px-4 py-3 space-y-2">
                <h3 className="font-semibold text-sm leading-none truncate">{w.name}</h3>
                {/* Same route treatment as UserApplications `ApplicationCard` */}
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{w.applicationCountry.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span>{w.destinationCountry.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{w.description || 'No description'}</p>
            </CardHeader>

            <CardContent className="px-4 pt-0 pb-4 flex flex-col flex-1">
                <div className="mt-auto flex items-center justify-between pt-4 border-t">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onSelect={() => onEdit(w)}>
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link to={`${ROUTES.ADMIN.WORKFLOW_BUILDER}?id=${encodeURIComponent(w.id)}`}>
                        <Button size="sm">Open</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

function Workflows() {
    const [search, setSearch] = useState('')
    const [importOpen, setImportOpen] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const importInputRef = useRef<HTMLInputElement>(null)

    const [formOpen, setFormOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [form, setForm] = useState(emptyWorkflowForm)

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return SAMPLE_WORKFLOWS.filter((w) => {
            const inName = w.name.toLowerCase().includes(q)
            const inDesc = w.description.toLowerCase().includes(q)
            const inApp = w.applicationCountry.name.toLowerCase().includes(q)
            const inDest = w.destinationCountry.name.toLowerCase().includes(q)
            return inName || inDesc || inApp || inDest
        })
    }, [search])

    const openCreateModal = () => {
        setEditMode(false)
        setForm(emptyWorkflowForm())
        setFormOpen(true)
    }

    const openEditModal = (w: WorkflowItem) => {
        setEditMode(true)
        setForm({
            thumbnail: w.thumbnail ?? '',
            name: w.name,
            description: w.description,
            applicationCountryId: w.applicationCountry._id,
            destinationCountryId: w.destinationCountry._id
        })
        setFormOpen(true)
    }

    const handleFormSubmit = () => {
        if (!form.name.trim()) return
        if (!form.applicationCountryId || !form.destinationCountryId) {
            window.alert('Please select both application country and destination country.')
            return
        }
        if (form.thumbnail && !validateThumbnailUrl(form.thumbnail)) {
            window.alert('Please enter a valid HTTPS URL ending with .jpg, .png, .gif, or .webp')
            return
        }
        setFormOpen(false)
        setForm(emptyWorkflowForm())
        setEditMode(false)
    }

    const resetImportState = () => {
        setImportFile(null)
        if (importInputRef.current) importInputRef.current.value = ''
    }

    const handleImportOpenChange = (open: boolean) => {
        setImportOpen(open)
        if (!open) resetImportState()
    }

    const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setImportFile(file)
    }

    const handleImportConfirm = () => {
        if (!importFile) return
        setImportOpen(false)
        resetImportState()
    }

    return (
        <div className="bg-background">
            <Header
                title="Workflows"
                subtitle="Manage your automated workflows"
                actions={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => setImportOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import Workflow
                        </Button>
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={openCreateModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Workflow
                        </Button>
                    </>
                }
            />

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search workflows..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">No workflows found.</div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((w) => (
                            <WorkflowCard
                                key={w.id}
                                workflow={w}
                                onEdit={openEditModal}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={importOpen}
                onOpenChange={handleImportOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Import workflow</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Choose a workflow JSON file. Upload to the server will run here once the API is wired; this dialog only manages the UI for
                            now.
                        </p>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept=".json,application/json"
                            className="sr-only"
                            onChange={handleImportFileChange}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => importInputRef.current?.click()}>
                                Choose file
                            </Button>
                            <span className="text-sm text-muted-foreground truncate max-w-[220px]">
                                {importFile ? importFile.name : 'No file chosen'}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleImportOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleImportConfirm}
                            disabled={!importFile}>
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) {
                        setForm(emptyWorkflowForm())
                        setEditMode(false)
                    }
                }}>
                <DialogContent className="sm:max-w-lg max-h-[min(90vh,720px)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editMode ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Thumbnail URL (Optional)</label>
                            <div className="relative">
                                <Input
                                    placeholder="https://example.com/thumbnail.jpg"
                                    value={form.thumbnail}
                                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                                    className="pl-9"
                                />
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>

                            {form.thumbnail ? (
                                <div className="relative group mt-2">
                                    <img
                                        src={form.thumbnail}
                                        alt="Thumbnail preview"
                                        className="w-full h-32 object-cover rounded-lg border"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.onerror = null
                                            target.src = 'https://placehold.co/400x200/e2e8f0/64748b?text=Invalid+URL'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, thumbnail: '' })}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-4 w-4" />
                                    </button>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <ExternalLink className="h-3 w-3" />
                                        HTTPS URL only (jpg, png, gif, webp)
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <CountryListField
                            label="Application country"
                            valueId={form.applicationCountryId}
                            onChange={(applicationCountryId) => setForm({ ...form, applicationCountryId })}
                        />

                        <CountryListField
                            label="Destination country"
                            valueId={form.destinationCountryId}
                            onChange={(destinationCountryId) => setForm({ ...form, destinationCountryId })}
                        />

                        <Input
                            placeholder="Workflow name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <Textarea
                            placeholder="Short description..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleFormSubmit}
                            disabled={!form.name.trim() || !form.applicationCountryId || !form.destinationCountryId}>
                            {editMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Workflows
