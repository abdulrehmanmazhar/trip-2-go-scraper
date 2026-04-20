import pidusage from 'pidusage'
import si from 'systeminformation'

export const getProcessStats = async (pid: number) => {
    const stats = await pidusage(pid)
    return {
        timestamp: Date.now(),
        pid: stats.pid,
        cpu: parseFloat(stats.cpu.toFixed(2)),
        memoryMB: parseFloat((stats.memory / 1024 / 1024).toFixed(2)),
        uptime: stats.ctime
    }
}

export const getQuickHealth = async () => {
    const [cpu, mem, disk] = await Promise.all([si.currentLoad(), si.mem(), si.fsSize()])

    return {
        cpu: `${cpu.currentLoad.toFixed(1)}%`,
        memory: `${((mem.used / mem.total) * 100).toFixed(1)}%`,
        disk: disk.map((d) => ({
            mount: d.mount,
            usage: `${d.use}%`
        })),
        isHealthy: cpu.currentLoad < 80 && mem.used / mem.total < 0.85 && !disk.some((d) => d.use > 90)
    }
}

export const getMachineInfo = async () => {
    const [cpu, mem, os, disk, network, system, bios, graphics] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.fsSize(),
        si.networkInterfaces(),
        si.system(),
        si.bios(),
        si.graphics()
    ])

    const time = si.time()

    return {
        // Basic Machine Info
        machine: {
            manufacturer: system.manufacturer,
            model: system.model,
            version: system.version,
            serial: system.serial
        },

        // Operating System
        os: {
            platform: os.platform,
            distro: os.distro,
            release: os.release,
            kernel: os.kernel,
            arch: os.arch,
            codename: os.codename,
            build: os.build
        },

        // CPU
        cpu: {
            model: cpu.brand,
            manufacturer: cpu.manufacturer,
            cores: cpu.cores,
            physicalCores: cpu.physicalCores,
            speed: `${cpu.speed}GHz`,
            speedMin: `${cpu.speedMin}GHz`,
            speedMax: `${cpu.speedMax}GHz`,
            virtualization: cpu.virtualization,
            cache: cpu.cache
        },

        // Memory (RAM)
        memory: {
            total: `${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
            free: `${(mem.free / 1024 / 1024 / 1024).toFixed(2)} GB`,
            swapTotal: `${(mem.swaptotal / 1024 / 1024 / 1024).toFixed(2)} GB`,
            swapFree: `${(mem.swapfree / 1024 / 1024 / 1024).toFixed(2)} GB`
        },

        // Storage (Disks)
        storage: disk.map((d) => ({
            filesystem: d.fs,
            mount: d.mount,
            type: d.type,
            size: `${(d.size / 1024 / 1024 / 1024).toFixed(2)} GB`,
            used: `${(d.used / 1024 / 1024 / 1024).toFixed(2)} GB`,
            available: `${(d.available / 1024 / 1024 / 1024).toFixed(2)} GB`,
            usePercentage: `${d.use}%`
        })),

        // Network
        network: network
            .filter((n) => n.ip4 || n.ip6) // Filter out empty interfaces
            .map((n) => ({
                interface: n.iface,
                ip4: n.ip4 || 'N/A',
                ip6: n.ip6 || 'N/A',
                mac: n.mac,
                internal: n.internal,
                speed: n.speed ? `${n.speed} Mbps` : 'Unknown',
                type: n.type
            })),

        // BIOS/Firmware
        bios: {
            vendor: bios.vendor,
            version: bios.version,
            date: bios.releaseDate
        },

        // Graphics/GPU
        graphics: {
            controllers: graphics.controllers.map((g) => ({
                model: g.model,
                vendor: g.vendor,
                vram: g.vram ? `${g.vram} MB` : 'Unknown',
                driverVersion: g.driverVersion || 'Unknown'
            })),
            displays: graphics.displays.map((d) => ({
                model: d.model || 'Unknown',
                resolution: `${d.resolutionX}x${d.resolutionY}`,
                refreshRate: `${d.currentRefreshRate}Hz`,
                builtin: d.builtin
            }))
        },

        // System Uptime
        uptime: {
            system: `${Math.floor(time.uptime / 3600)}h ${Math.floor((time.uptime % 3600) / 60)}m`,
            seconds: time.uptime
        }
    }
}
