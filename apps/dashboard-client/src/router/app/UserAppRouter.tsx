import AboutDeveloper from '@/components/features/about-developer'
import PrivacyPolicy from '@/components/features/privacy-policy'
import TermsAndConditions from '@/components/features/terms-and-conditions'
import AppointmentForm from '@/pages/AppointmentForm'

import NotFound from '@/pages/NotFound'
import PaymentForm from '@/pages/PaymentForm'
import Profile from '@/pages/Profile'
import UserApplications from '@/pages/UserApplications'

import { Route, Routes } from 'react-router-dom'

type Props = {}

function UserAppRouter({}: Props) {
    return (
        <Routes>
            <Route
                path="/"
                element={<UserApplications />}
            />
            <Route
                path="/profile"
                element={<Profile />}
            />
            <Route
                path="/appointment-form"
                element={<AppointmentForm />}
            />
            <Route
                path="/payment-form"
                element={<PaymentForm />}
            />
            <Route
                path="/terms"
                element={<TermsAndConditions />}
            />
            <Route
                path="/privacy"
                element={<PrivacyPolicy />}
            />
            <Route
                path="/about"
                element={<AboutDeveloper />}
            />
            <Route
                path="*"
                element={<NotFound />}
            />
        </Routes>
    )
}

export default UserAppRouter
