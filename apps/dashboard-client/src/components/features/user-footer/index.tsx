import { Link } from 'react-router-dom'

type Props = {}

function UserFooter({}: Props) {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} VisaPortal. All rights reserved.</p>

                <p>Powered by © FIGGO ATLAS. All rights reserved.</p>

                <div className="flex items-center gap-6">
                    <Link to="#">Privacy Policy</Link>
                    <Link to="#">Terms of Service</Link>
                    <Link to="#">Support</Link>
                </div>
            </div>
        </footer>
    )
}

export default UserFooter
