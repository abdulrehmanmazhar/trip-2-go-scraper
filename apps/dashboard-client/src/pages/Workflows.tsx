import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import Header from '@/components/features/header'
import { ConfirmationModal } from '@/components/features/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
    EditIcon,
    Plus,
    Search,
    Play,
    MoreVertical,
    Trash2,
    Download,
    ExternalLink,
    ImageIcon,
    X,
    Upload,
    ArrowRight,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import {
    deleteWorkflowRecord,
    downloadWorkflowExport,
    fetchCountries,
    fetchWorkflowsPage,
    patchWorkflow,
    postImportWorkflow,
    postWorkflow,
    type CountryOption,
    type WorkflowListData,
    type WorkflowRecord
} from '@/utils/workflowApi'
import { toast } from 'sonner'

const PAGE_LIMIT = 9

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

function CountryRowButton({
    country,
    selected,
    onSelect,
    disabled
}: {
    country: CountryOption
    selected: boolean
    onSelect: (id: string) => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(country._id)}
            className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/70',
                selected && 'bg-muted',
                disabled && 'opacity-50'
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

function CountryListField({
    label,
    valueId,
    onChange,
    countries,
    disabled
}: {
    label: string
    valueId: string
    onChange: (id: string) => void
    countries: CountryOption[]
    disabled?: boolean
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="max-h-44 overflow-y-auto rounded-md border border-border/60 divide-y divide-border/60 bg-background">
                {countries.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground">No countries available.</div>
                ) : (
                    countries.map((c) => (
                        <CountryRowButton
                            key={c._id}
                            country={c}
                            selected={valueId === c._id}
                            onSelect={onChange}
                            disabled={disabled}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function WorkflowCard({
    workflow: w,
    onEdit,
    onDelete,
    onExport,
    busy
}: {
    workflow: WorkflowRecord
    onEdit: (workflow: WorkflowRecord) => void
    onDelete: (workflow: WorkflowRecord) => void
    onExport: (workflow: WorkflowRecord) => void
    busy: boolean
}) {
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
                                className="h-8 w-8 p-0"
                                disabled={busy}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                disabled={busy}
                                onSelect={() => onEdit(w)}>
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={busy}
                                onSelect={() => onDelete(w)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={busy}
                                onSelect={() => void onExport(w)}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link to={`${ROUTES.ADMIN.WORKFLOW_BUILDER}?id=${encodeURIComponent(w.id)}`}>
                        <Button
                            size="sm"
                            disabled={busy}>
                            Open
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

type DeleteDialog = { open: false } | { open: true; workflow: WorkflowRecord }

function Workflows() {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)

    const [countries, setCountries] = useState<CountryOption[]>([])
    const [countriesLoading, setCountriesLoading] = useState(true)

    const [list, setList] = useState<WorkflowListData | null>(null)
    const [workflowsLoading, setWorkflowsLoading] = useState(true)
    const [workflowsError, setWorkflowsError] = useState<string | null>(null)

    const [importOpen, setImportOpen] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importBusy, setImportBusy] = useState(false)
    const importInputRef = useRef<HTMLInputElement>(null)

    const [formOpen, setFormOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyWorkflowForm)
    const [formBusy, setFormBusy] = useState(false)
    const defFileInputRef = useRef<HTMLInputElement>(null)

    const [actingId, setActingId] = useState<string | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({ open: false })

    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
        return () => window.clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const loadCountries = useCallback(async () => {
        setCountriesLoading(true)
        try {
            const data = await fetchCountries()
            setCountries(data)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to load countries')
        } finally {
            setCountriesLoading(false)
        }
    }, [])

    const loadWorkflows = useCallback(async () => {
        setWorkflowsLoading(true)
        setWorkflowsError(null)
        try {
            const data = await fetchWorkflowsPage({ page, limit: PAGE_LIMIT, search: debouncedSearch })
            setList(data)
            if (data.total > 0 && page > data.totalPages) {
                setPage(data.totalPages)
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load workflows'
            setWorkflowsError(msg)
            toast.error(msg)
        } finally {
            setWorkflowsLoading(false)
        }
    }, [page, debouncedSearch])

    useEffect(() => {
        void loadCountries()
    }, [loadCountries])

    useEffect(() => {
        void loadWorkflows()
    }, [loadWorkflows])

    const total = list?.total ?? 0
    const totalPages = list?.totalPages ?? 1
    const items = list?.items ?? []

    const rangeLabel = useMemo(() => {
        if (total === 0) return '0 workflows'
        const start = (page - 1) * PAGE_LIMIT + 1
        const end = Math.min(page * PAGE_LIMIT, total)
        return `${start}–${end} of ${total}`
    }, [page, total])

    const openCreateModal = () => {
        setEditMode(false)
        setEditingId(null)
        setForm(emptyWorkflowForm())
        if (defFileInputRef.current) defFileInputRef.current.value = ''
        setFormOpen(true)
    }

    const openEditModal = (w: WorkflowRecord) => {
        setEditMode(true)
        setEditingId(w.id)
        setForm({
            thumbnail: w.thumbnail ?? '',
            name: w.name,
            description: w.description,
            applicationCountryId: w.applicationCountry._id,
            destinationCountryId: w.destinationCountry._id
        })
        if (defFileInputRef.current) defFileInputRef.current.value = ''
        setFormOpen(true)
    }

    const handleFormSubmit = async () => {
        if (!form.name.trim()) return
        if (!form.applicationCountryId || !form.destinationCountryId) {
            toast.error('Please select both application country and destination country.')
            return
        }
        if (form.thumbnail && !validateThumbnailUrl(form.thumbnail)) {
            toast.error('Please enter a valid HTTPS URL ending with .jpg, .png, .gif, or .webp')
            return
        }

        const defFile = defFileInputRef.current?.files?.[0] ?? null

        if (!editMode && !defFile) {
            toast.error('Please attach a workflow definition JSON file.')
            return
        }

        setFormBusy(true)
        try {
            const fd = new FormData()
            fd.append('name', form.name.trim())
            fd.append('description', form.description)
            if (form.thumbnail.trim()) fd.append('thumbnail', form.thumbnail.trim())
            fd.append('applicationCountryId', form.applicationCountryId)
            fd.append('destinationCountryId', form.destinationCountryId)
            if (defFile) fd.append('workflowFile', defFile)

            if (editMode && editingId) {
                await patchWorkflow(editingId, fd)
                toast.success('Workflow updated')
            } else {
                await postWorkflow(fd)
                toast.success('Workflow created')
            }
            setFormOpen(false)
            setForm(emptyWorkflowForm())
            setEditMode(false)
            setEditingId(null)
            if (defFileInputRef.current) defFileInputRef.current.value = ''
            await loadWorkflows()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Request failed')
        } finally {
            setFormBusy(false)
        }
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

    const handleImportConfirm = async () => {
        if (!importFile) return
        setImportBusy(true)
        try {
            const fd = new FormData()
            fd.append('workflowFile', importFile)
            await postImportWorkflow(fd)
            toast.success('Workflow imported')
            setImportOpen(false)
            resetImportState()
            setPage(1)
            await loadWorkflows()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Import failed')
        } finally {
            setImportBusy(false)
        }
    }

    const handleExport = async (w: WorkflowRecord) => {
        setActingId(w.id)
        try {
            await downloadWorkflowExport(w.id, w.name)
            toast.success('Download started')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Export failed')
        } finally {
            setActingId(null)
        }
    }

    const runDelete = async () => {
        if (!deleteDialog.open) return
        const { workflow } = deleteDialog
        setActingId(workflow.id)
        try {
            await deleteWorkflowRecord(workflow.id)
            toast.success('Workflow deleted')
            setDeleteDialog({ open: false })
            await loadWorkflows()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Delete failed')
        } finally {
            setActingId(null)
        }
    }

    const countriesDisabled = countriesLoading || countries.length === 0

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search workflows..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-2 self-start sm:self-auto"
                        disabled={workflowsLoading}
                        onClick={() => void loadWorkflows()}>
                        <RefreshCw className={cn('h-4 w-4', workflowsLoading && 'animate-spin')} />
                        Refresh
                    </Button>
                </div>

                {workflowsLoading && items.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">Loading workflows…</div>
                ) : workflowsError && items.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                        <p className="text-sm text-muted-foreground">{workflowsError}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void loadWorkflows()}>
                            Try again
                        </Button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">No workflows found.</div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((w) => (
                            <WorkflowCard
                                key={w.id}
                                workflow={w}
                                busy={actingId === w.id}
                                onEdit={openEditModal}
                                onExport={handleExport}
                                onDelete={(wf) => setDeleteDialog({ open: true, workflow: wf })}
                            />
                        ))}
                    </div>
                )}

                {total > 0 ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 pt-6">
                        <p className="text-sm text-muted-foreground">Showing {rangeLabel}</p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || workflowsLoading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm tabular-nums text-muted-foreground px-2">
                                Page {page} / {totalPages}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages || workflowsLoading}
                                onClick={() => setPage((p) => p + 1)}>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : null}
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
                            Upload a <span className="font-medium text-foreground">.workflow</span> bundle (JSON). It must include{' '}
                            <code className="text-xs bg-muted px-1 rounded">version</code> (use{' '}
                            <code className="text-xs bg-muted px-1 rounded">1</code>), <code className="text-xs bg-muted px-1 rounded">name</code>,{' '}
                            <code className="text-xs bg-muted px-1 rounded">description</code>,{' '}
                            <code className="text-xs bg-muted px-1 rounded">applicationCountry</code> and{' '}
                            <code className="text-xs bg-muted px-1 rounded">destinationCountry</code> as MongoDB country{' '}
                            <code className="text-xs bg-muted px-1 rounded">_id</code> strings, plus a{' '}
                            <code className="text-xs bg-muted px-1 rounded">definition</code> object. No extra fields are required in this dialog.
                        </p>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept=".workflow,application/json"
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
                            onClick={() => void handleImportConfirm()}
                            disabled={!importFile || importBusy}>
                            {importBusy ? 'Importing…' : 'Import'}
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
                        setEditingId(null)
                        if (defFileInputRef.current) defFileInputRef.current.value = ''
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
                            countries={countries}
                            disabled={countriesDisabled}
                        />

                        <CountryListField
                            label="Destination country"
                            valueId={form.destinationCountryId}
                            onChange={(destinationCountryId) => setForm({ ...form, destinationCountryId })}
                            countries={countries}
                            disabled={countriesDisabled}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {editMode ? 'Replace workflow JSON (optional)' : 'Workflow definition JSON (required)'}
                            </label>
                            <input
                                ref={defFileInputRef}
                                type="file"
                                accept=".json,application/json"
                                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
                            />
                            <p className="text-xs text-muted-foreground">
                                {editMode
                                    ? 'Leave empty to keep the current definition in storage. If you attach a file, it replaces the stored definition.'
                                    : 'The JSON you upload is stored as the workflow definition and combined with the details above.'}
                            </p>
                        </div>
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
                            onClick={() => void handleFormSubmit()}
                            disabled={formBusy || !form.name.trim() || !form.applicationCountryId || !form.destinationCountryId || countriesDisabled}>
                            {formBusy ? 'Saving…' : editMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationModal
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) setDeleteDialog({ open: false })
                }}
                title="Delete this workflow?"
                description={
                    deleteDialog.open ? `Permanently remove “${deleteDialog.workflow.name}” and its stored definition. This cannot be undone.` : ''
                }
                type="destructive"
                confirmLabel="Delete"
                onConfirmation={() => void runDelete()}
                onCancel={() => setDeleteDialog({ open: false })}
                pending={deleteDialog.open && actingId === deleteDialog.workflow.id}
            />
        </div>
    )
}

export default Workflows
