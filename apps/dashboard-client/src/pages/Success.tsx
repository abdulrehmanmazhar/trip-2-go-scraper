import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Success() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-md">
                <Card>
                    <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
                        {/* Icon */}
                        <div className="flex flex-col items-center space-y-2">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                            <p className="text-sm text-muted-foreground">Success</p>
                        </div>

                        {/* Title + Description */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-medium">Bot approved</h2>
                            <p className="text-sm text-muted-foreground">
                                Your bot has been successfully verified and approved. You can now return to your terminal and start the bot.
                            </p>
                        </div>

                        {/* Action */}
                        <Button
                            asChild
                            variant="outline"
                            className="gap-2">
                            <Link to="/auth/login">Back to dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
