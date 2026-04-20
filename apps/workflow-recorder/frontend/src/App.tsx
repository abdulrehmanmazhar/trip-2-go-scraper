import { HashRouter } from 'react-router-dom'
import ShadcnSidebarLayout from './components/features/layout'
import { ThemeProvider } from './context/ThemeProvider'
// import Home from './pages/Home'
import Router from './router'
import { ReactFlowProvider } from 'reactflow'

function App() {
    return (
        <>
            <ThemeProvider>
                <ReactFlowProvider>
                    <HashRouter>
                        <ShadcnSidebarLayout>
                            {/* <Home /> */}
                            <Router />
                        </ShadcnSidebarLayout>
                    </HashRouter>
                </ReactFlowProvider>
            </ThemeProvider>
        </>
    )
}

export default App
