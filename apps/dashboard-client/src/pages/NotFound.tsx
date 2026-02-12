import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
            <h1 className="text-2xl font-bold">Page not found</h1>
            <p className="text-muted-foreground">The page you’re looking for doesn’t exist.</p>

            <Button asChild>
                <Link to="/login">Back to login</Link>
            </Button>
        </div>
    )
}
