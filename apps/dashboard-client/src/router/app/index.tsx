import AboutDeveloper from '@/components/features/about-developer'
import PrivacyPolicy from '@/components/features/privacy-policy'
import TermsAndConditions from '@/components/features/terms-and-conditions'
import Bots from '@/pages/Bots'
import Client from '@/pages/Client'
import ClientData from '@/pages/ClientData'
import Dashboard from '@/pages/Dashboard'
import LiveActivity from '@/pages/LiveActivity'
import NotFound from '@/pages/NotFound'
import WorkflowBuilder from '@/pages/WorkflowBuilder'
import Workflows from '@/pages/Workflows'
import { Route, Routes } from 'react-router-dom'

type Props = {}

function AppRouter({}: Props) {
    return (
        <Routes>
            <Route
                path="/"
                element={<Dashboard />}
            />
            <Route
                path="/live-activity"
                element={<LiveActivity />}
            />
            <Route
                path="/Bots"
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
                path="/clients"
                element={<Client />}
            />
            <Route
                path="/client-data"
                element={<ClientData />}
            />
            <Route
                path="*"
                element={<NotFound />}
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
        </Routes>
    )
}

export default AppRouter
