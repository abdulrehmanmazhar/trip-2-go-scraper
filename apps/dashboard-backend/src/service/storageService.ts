import * as Minio from 'minio'
import { Readable } from 'node:stream'

export const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
})

/** Dedicated bucket for workflow definition files. */
export const WORKFLOWS_BUCKET = 'workflows'

export async function ensureWorkflowsBucket(): Promise<void> {
    const exists = await minioClient.bucketExists(WORKFLOWS_BUCKET)
    if (!exists) {
        await minioClient.makeBucket(WORKFLOWS_BUCKET)
    }
}

export async function putWorkflowDefinition(objectKey: string, body: Buffer): Promise<void> {
    await minioClient.putObject(WORKFLOWS_BUCKET, objectKey, body, body.length, {
        'Content-Type': 'application/json'
    })
}

export async function removeWorkflowDefinition(objectKey: string): Promise<void> {
    await minioClient.removeObject(WORKFLOWS_BUCKET, objectKey)
}

async function readableToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array))
    }
    return Buffer.concat(chunks)
}

export async function getWorkflowDefinitionBuffer(objectKey: string): Promise<Buffer> {
    const stream = await minioClient.getObject(WORKFLOWS_BUCKET, objectKey)
    try {
        return await readableToBuffer(stream)
    } finally {
        stream.destroy()
    }
}
