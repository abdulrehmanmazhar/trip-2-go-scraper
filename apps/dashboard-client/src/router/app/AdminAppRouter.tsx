import AboutDeveloper from '@/components/features/about-developer'
import PrivacyPolicy from '@/components/features/privacy-policy'
import TermsAndConditions from '@/components/features/terms-and-conditions'
import Bots from '@/pages/Bots'
import Client from '@/pages/Client'
import ClientData from '@/pages/ClientData'
import Dashboard from '@/pages/Dashboard'
import LiveActivity from '@/pages/LiveActivity'
import NotFound from '@/pages/NotFound'
import Profile from '@/pages/Profile'
import WorkflowBuilder from '@/pages/WorkflowBuilder'
import WorkflowTest from '@/pages/WorkflowTest'
import Workflows from '@/pages/Workflows'
import { Route, Routes } from 'react-router-dom'

type Props = {}

function AdminAppRouter({}: Props) {
    return (
        <Routes>
            <Route
                path="/"
                element={<Dashboard />}
            />
            <Route
                path="/profile"
                element={<Profile />}
            />
            <Route
                path="/live-activity"
                element={<LiveActivity />}
            />
            <Route
                path="/bots"
                element={<Bots />}
            />
            <Route
                path="/workflows"
                element={<Workflows />}
            />
            <Route
                path="/workflow-builder"
                element={<WorkflowBuilder />}
            />
            <Route
                path="/workflow-test"
                element={<WorkflowTest />}
            />
            <Route
                path="/clients"
                element={<Client />}
            />
            <Route
                path="/client-data"
                element={<ClientData />}
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

export default AdminAppRouter
