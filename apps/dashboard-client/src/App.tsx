import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './components/features/theme-provider'
import { router } from './router'

function App() {
    console.log('app rendered')

    return (
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    )
}

export default App
