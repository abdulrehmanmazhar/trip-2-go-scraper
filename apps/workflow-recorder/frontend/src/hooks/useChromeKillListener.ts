import { useSelector } from 'react-redux'
import { useEffect, useRef } from 'react'
import type { RootState } from '@/redux/store' // Adjust import based on your store setup

interface Process {
    id: number
    name: string
    // other process properties
}

const useChromeKillListener = (onChromeKill?: () => void) => {
    const onChromeKillRef = useRef(onChromeKill)
    const previousChromeProcessRef = useRef<Process | null>(null)

    // Get current chrome process from Redux store
    const chromeProcess = useSelector((state: RootState) => state.process.processes.find((p: Process) => p.name === 'chrome'))

    // Update ref when callback changes
    useEffect(() => {
        onChromeKillRef.current = onChromeKill
    }, [onChromeKill])

    // Monitor chrome process changes
    useEffect(() => {
        // If there was a chrome process before but now it's gone
        if (previousChromeProcessRef.current && !chromeProcess) {
            console.log('Chrome process was killed')
            onChromeKillRef.current?.()
        }

        // Update the ref with current chrome process
        previousChromeProcessRef.current = chromeProcess || null
    }, [chromeProcess]) // Re-run when chromeProcess changes
}

export default useChromeKillListener
