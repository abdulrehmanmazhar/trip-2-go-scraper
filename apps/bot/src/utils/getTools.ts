import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { writeFile } from 'node:fs/promises'

export async function getTools() {
    const transport = new SSEClientTransport(new URL('http://localhost:8931/sse'))
    const client = new Client({ name: 'my-client', version: '1.0.0' }, { capabilities: {} })

    await client.connect(transport)

    // Retrieve the list of tools
    const tools = await client.listTools()

    await writeFile('tools.json', JSON.stringify(tools, null, 2))
    await transport.close()
}
