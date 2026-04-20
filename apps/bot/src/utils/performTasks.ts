import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { getRef } from './getRef.js'
import { buildElementIndex } from './buildElementIndex.js'
import { writeFile } from 'fs/promises'

export async function performTasks() {
    const transport = new SSEClientTransport(new URL('http://localhost:8931/sse'))

    const client = new Client({ name: 'my-client', version: '1.0.0' }, { capabilities: {} })

    await client.connect(transport)

    await client.callTool({
        name: 'browser_navigate',
        arguments: {
            url: 'https://google.com'
        }
    })

    const snapshot = await client.callTool({
        name: 'browser_snapshot',
        arguments: {}
    })

    // console.log(snapshot)

    // const ref = getRef(snapshot.content[0].text, '[active]')
    const ref = getRef(snapshot.content[0].text, 'Search')

    const elements = buildElementIndex(snapshot.content[0].text)

    console.log({ ref, elements })

    await client.callTool({
        name: 'browser_type',
        arguments: {
            ref,
            text: 'Node.js streaming tutorial',
            submit: true
        }
    })

    await client.callTool({
        name: 'browser_take_screenshot',
        arguments: {
            filename: 'search-results.png'
        }
    })

    const snapshot2 = await client.callTool({
        name: 'browser_snapshot',
        arguments: {}
    })

    const elements2 = buildElementIndex(snapshot2.content[0].text)

    await writeFile('snapshot2.json', JSON.stringify(snapshot2, null, 2))

    console.log({ snapshot2, elements2 })

    await transport.close()
}
