import { useState } from 'react'
import Header from '@/components/features/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditIcon, Plus, Search, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const [workflows, setWorkflows] = useState([
        {
            id: 1,
            name: 'Login Flow',
            description: 'Automates login process with email/password',
            createdAt: '2026-04-10'
        },
        {
            id: 2,
            name: 'Checkout Bot',
            description: 'Auto checkout workflow for ecommerce',
            createdAt: '2026-04-12'
        },
        {
            id: 3,
            name: 'Scraper v1',
            description: 'Extracts product data from listings',
            createdAt: '2026-04-14'
        }
    ])

    const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' })

    const filtered = workflows.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))

    const handleCreate = () => {
        if (!newWorkflow.name.trim()) return

        setWorkflows([
            ...workflows,
            {
                id: Date.now(),
                name: newWorkflow.name,
                description: newWorkflow.description,
                createdAt: new Date().toISOString().split('T')[0]
            }
        ])

        setNewWorkflow({ name: '', description: '' })
        setOpen(false)
    }

    return (
        <div>
            <Header
                title="Dashboard"
                subtitle="Manage your recorded workflows"
                actions={
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Workflow
                    </Button>
                }
            />

            <div className="p-6 space-y-6">
                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search workflows..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Cards */}
                {filtered.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">No workflows found.</div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((w) => (
                            <Card
                                key={w.id}
                                className="group rounded-2xl overflow-hidden border bg-background shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col h-full">
                                {/* Thumbnail Header */}
                                <div className="relative h-24 bg-muted flex items-center justify-between px-4 border-b">
                                    <div className="text-sm font-semibold">WF</div>

                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs">
                                            {w.createdAt}
                                        </Badge>
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Play className="w-20 h-20 text-foreground/5" />
                                    </div>
                                </div>

                                <CardHeader className="px-4 py-3 space-y-1">
                                    <h3 className="font-semibold text-sm leading-none truncate">{w.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-3">{w.description}</p>
                                </CardHeader>

                                {/* Flexible Content Area */}
                                <CardContent className="px-4 pt-0 pb-4 flex flex-col flex-1">
                                    {/* push footer down */}
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm">
                                            <EditIcon className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>

                                        <Link to={'/recorder'}>
                                            <Button size="sm">Open</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <Dialog
                    open={open}
                    onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Workflow</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <Input
                                placeholder="Workflow name"
                                value={newWorkflow.name}
                                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                            />

                            <Textarea
                                placeholder="Short description..."
                                value={newWorkflow.description}
                                onChange={(e) =>
                                    setNewWorkflow({
                                        ...newWorkflow,
                                        description: e.target.value
                                    })
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
