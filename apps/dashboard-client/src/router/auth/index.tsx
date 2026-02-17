import ForgotPassword from '@/pages/ForgotPassword'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Otp from '@/pages/Otp'
import ResetPassword from '@/pages/ResetPassword'
import Signup from '@/pages/Signup'
import { Route, Routes } from 'react-router-dom'

type Props = {}

function AuthRouter({}: Props) {
    return (
        <Routes>
            <Route
                path="/login"
                element={<Login />}
            />
            <Route
                path="/signup"
                element={<Signup />}
            />
            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />
            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />
            <Route
                path="/otp"
                element={<Otp />}
            />
            <Route
                path="*"
                element={<NotFound />}
            />
        </Routes>
    )
}

export default AuthRouter
