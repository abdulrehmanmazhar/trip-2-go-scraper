import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Play, Square, Save, MousePointer, Type, Navigation } from 'lucide-react'
import Header from '@/components/features/header'
import ReactFlowCanvas from '@/components/features/react-flow/ReactFlowCanvas'

export default function Recorder() {
    const [isRecording, setIsRecording] = useState(false)
    const [openInspector, setOpenInspector] = useState(false)

    return (
        <div className="flex h-full bg-muted/40 text-foreground">
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <Header
                    title="Recorder"
                    subtitle="Manage your workflow actions"
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isRecording ? 'destructive' : 'default'}
                                onClick={() => setIsRecording(!isRecording)}>
                                {isRecording ? <Square size={16} /> : <Play size={16} />}
                                <span className="ml-2">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                            </Button>

                            <Button variant="outline">
                                <Save
                                    size={16}
                                    className="mr-2"
                                />
                                Save
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => setOpenInspector(true)}>
                                Inspector
                            </Button>
                        </div>
                    }
                />

                {/* Content */}
                <div className="flex flex-1 relative overflow-hidden">
                    {/* 🎯 Floating Toolbar (Photoshop style) */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <div className="flex flex-col gap-2 p-2 rounded-2xl border bg-background shadow-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10">
                                <MousePointer className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10">
                                <Type className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10">
                                <Navigation className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Canvas */}
                    {/* <div className="flex-1 flex items-center justify-center text-muted-foreground">React Flow Canvas (Drag & Connect Actions)</div> */}
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <ReactFlowCanvas />
                    </div>
                </div>
            </div>

            {/* 🧠 Inspector Sheet */}
            <Sheet
                open={openInspector}
                onOpenChange={setOpenInspector}>
                <SheetContent
                    side="right"
                    className="w-80">
                    <SheetHeader>
                        <SheetTitle>Inspector</SheetTitle>
                    </SheetHeader>

                    <div className="mt-4 space-y-3 px-4">
                        <Input placeholder="Action Name" />
                        <Input placeholder="Selector / Target" />
                        <Input placeholder="Value (if input)" />
                        <Button className="w-full">Update Action</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
