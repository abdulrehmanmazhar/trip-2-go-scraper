import { createBrowserRouter, Navigate } from 'react-router-dom'
import ShadcnSidebarLayout from '@/components/features/shadcn-sidebar-layout'
import AdminAppRouter from './app/AdminAppRouter'
import UserAppRouter from './app/UserAppRouter'
import { adminGuard, authGuard } from './auth-gaurd'
import NotFound from '@/pages/NotFound'
import AuthRouter from './auth'
import VerifyBot from '@/pages/VerifyBot'

export const router = createBrowserRouter([
    {
        path: '/auth/*',
        element: <AuthRouter />
    },
    {
        path: '/u/*',
        loader: authGuard,
        element: <UserAppRouter />
    },
    {
        path: '/admin/*',
        loader: adminGuard,
        element: (
            <ShadcnSidebarLayout>
                <AdminAppRouter />
            </ShadcnSidebarLayout>
        )
    },
    {
        path: '/verify-bot/:botId',
        element: <VerifyBot />
    },
    {
        path: '/',
        element: (
            <Navigate
                to="/auth/login"
                replace
            />
        )
    },
    {
        path: '*',
        element: <NotFound />
    }
])
