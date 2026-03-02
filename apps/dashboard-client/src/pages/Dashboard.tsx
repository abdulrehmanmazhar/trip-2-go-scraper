import Header from '@/components/features/header'

type Props = {}

function Dashboard({}: Props) {
    return (
        <div>
            <Header
                title="Dashboard"
                subtitle="Manage clients, applications and bots"
            />
        </div>
    )
}

export default Dashboard
