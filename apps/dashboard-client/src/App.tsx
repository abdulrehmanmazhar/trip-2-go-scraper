import { BrowserRouter as Routing } from 'react-router-dom'
import AppRouter from './router/app'
import ShadcnSidebarLayout from './components/features/shadcn-sidebar-layout'
import { ThemeProvider } from './components/features/theme-provider'
// import Otp from './pages/Otp'
// import Signup from './pages/Signup'
// import ForgotPassword from './pages/ForgotPassword'
// import ResetPassword from './pages/ResetPassword'
// import Login from './pages/Login'
// import { useCheckLogin } from './hooks/use-check-login'
function App() {
    // const { refreshLoginTimestamp, isLoggedIn } = useCheckLogin()
    return (
        <>
            <ThemeProvider>
                <Routing>
                    <ShadcnSidebarLayout>
                        <AppRouter />
                    </ShadcnSidebarLayout>
                </Routing>
                {/* <Otp /> */}
                {/* <Signup /> */}
                {/* <ForgotPassword /> */}
                {/* <ResetPassword /> */}
                {/* <Login /> */}
            </ThemeProvider>
        </>
    )
}

export default App
