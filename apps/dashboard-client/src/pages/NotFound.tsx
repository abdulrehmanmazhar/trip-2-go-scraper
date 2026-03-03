import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-md">
                <Card>
                    <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
                        {/* 404 */}
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Error</p>
                            <h1 className="text-6xl font-semibold tracking-tight">404</h1>
                        </div>

                        {/* Title + Description */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-medium">Page not found</h2>
                            <p className="text-sm text-muted-foreground">The page you are looking for does not exist or may have been removed.</p>
                        </div>

                        {/* Action */}
                        <Button
                            asChild
                            variant="outline"
                            className="gap-2">
                            <Link to="/auth/login">
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
