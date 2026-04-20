import { Background, Controls, ReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'
import PlaywrightAction from './PlaywrightAction'
// import { browserDummyNodes as nodes } from '@/constants/actions'
// import { browserWorkflowNodes as nodes } from '@/constants/actions'
// import { playWrightActionNodes as nodes } from '@/constants/actions'
// import { networkInterceptorDummyNodes as nodes } from '@/constants/actions'
// import { networkWorkflowNodes as nodes } from '@/constants/actions'
// import { interruptionDummyNodes as nodes } from '@/constants/actions'
import { serverActionDummyNodes as nodes } from '@/constants/actions'
import BrowserSessionAction from './BrowserSessionAction'
import NetworkInterceptorAction from './NetworkInterceptorAction'
import ServerAction from './ServerAction'
import InterruptionAction from './InterruptionAction'
import ControlFlowAction from './ControlFlowAction'

const nodeTypes = {
    playwrightAction: PlaywrightAction,
    browserAction: BrowserSessionAction,
    networkInterceptor: NetworkInterceptorAction,
    serverAction: ServerAction,
    interruptionAction: InterruptionAction,
    controlFlowAction: ControlFlowAction
}

function ReactFlowCanvas() {
    console.log('Rendering ReactFlowCanvas with nodes:')
    return (
        <ReactFlow
            fitView
            nodes={nodes}
            nodeTypes={nodeTypes}>
            <Background />
            <Controls />
        </ReactFlow>
    )
}

export default ReactFlowCanvas
