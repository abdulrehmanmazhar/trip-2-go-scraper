import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router/app'
import ShadcnSidebarLayout from './components/features/shadcn-sidebar-layout'
import { ThemeProvider } from './components/features/theme-provider'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Otp from './pages/Otp'

function App() {
    console.log('app rendered')

    return (
        <ThemeProvider>
            <BrowserRouter>
                <ShadcnSidebarLayout>
                    <AppRouter />
                </ShadcnSidebarLayout>
                {/* <Login /> */}
                {/* <Signup /> */}
                {/* <ForgotPassword /> */}
                {/* <Otp /> */}
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
