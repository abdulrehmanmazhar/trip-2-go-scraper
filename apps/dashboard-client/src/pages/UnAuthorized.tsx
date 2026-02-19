import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function UnAuthorized() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
            <h1 className="text-2xl font-bold">Unauthorized</h1>
            <p className="text-muted-foreground">You don’t have permission to access this page.</p>

            <Button asChild>
                <Link to="/auth/login">Back to login</Link>
            </Button>
        </div>
    )
}
