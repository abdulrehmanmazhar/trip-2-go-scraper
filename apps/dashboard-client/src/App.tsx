import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './components/features/theme-provider'
import { router } from './router'
import { Provider, useDispatch } from 'react-redux'
import store from './redux/store'
import { Toaster } from '@/components/ui/sonner'

function Boot() {
    const dispatch = useDispatch()
    dispatch({ type: '/boot' })

    return <></>
}

function App() {
    console.log('app rendered')

    return (
        <Provider store={store}>
            <Boot />
            <ThemeProvider>
                <Toaster />
                <RouterProvider router={router} />
            </ThemeProvider>
        </Provider>
    )
}

export default App
