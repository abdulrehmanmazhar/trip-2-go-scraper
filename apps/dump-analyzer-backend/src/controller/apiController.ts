import type { NextFunction, Request, Response } from 'express'
import httpResponse from '../util/httpResponse.js'
import responseMessage from '../constant/responseMessage.js'
import httpError from '../util/httpError.js'
import config from '../config/config.js'
import { readDirRecursive } from '../util/readDirRecursive.js'
import { readFile } from 'node:fs/promises'

type FilterRequestInterface = {
    search: string
    index: number
    type: 'all' | 'req' | 'res'
    timestampSort: boolean
}

type FilterResponseInterface = {
    files: string[]
}

export default {
    self: (req: Request, res: Response, nextFunc: NextFunction) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (error) {
            httpError(nextFunc, error as Error, req, 500)
        }
    },
    filter_dump: async (req: Request, res: Response, nextFunc: NextFunction) => {
        try {
            const filters = req.body as FilterRequestInterface

            let files: string[] = []
            const allFiles = readDirRecursive(config.DUMP_URL!)

            // filter by type
            if (filters.type === 'all') {
                files = allFiles
            } else if (filters.type === 'res') {
                files = allFiles.filter((fp) => fp.includes('response'))
            } else if (filters.type === 'req') {
                files = allFiles.filter((fp) => fp.includes('request'))
            }

            type FileWithTimestamp = { filePath: string; timestamp: number }

            const filteredFiles: FileWithTimestamp[] = []

            // filter by search and read timestamps
            for (const fp of files) {
                try {
                    const raw = await readFile(fp, 'utf-8')
                    const json = JSON.parse(raw) as { url?: string; timestamp?: number }

                    if (json.url && json.url.includes(filters.search)) {
                        filteredFiles.push({
                            filePath: fp,
                            timestamp: json.timestamp ?? 0 // default 0 if missing
                        })
                    }
                } catch {
                    // ignore invalid JSON / read errors
                }
            }

            // sort by timestamp if requested
            if (filters.timestampSort) {
                filteredFiles.sort((a, b) => a.timestamp - b.timestamp)
            }

            // extract only file paths for response
            files = filteredFiles.map((f) => f.filePath)

            httpResponse(req, res, 200, responseMessage.SUCCESS, { files } as FilterResponseInterface)
        } catch (error) {
            httpError(nextFunc, error as Error, req, 500)
        }
    },
    get_json: async (req: Request, res: Response, nextFunc: NextFunction) => {
        try {
            const { file } = req.body as { file: string }

            const json = await readFile(file, 'utf-8')
            httpResponse(req, res, 200, responseMessage.SUCCESS, json)
        } catch (error) {
            httpError(nextFunc, error as Error, req, 500)
        }
    }
}
