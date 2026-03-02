import { Moon, Sun, User } from 'lucide-react'

import { SidebarFooter } from '@/components/ui/sidebar'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '../theme-provider'
import constants, { APIS, ROUTES } from '@/constants'
import { useDispatch, useSelector } from 'react-redux'
import { setAccessToken, setStatus, setUser } from '@/redux/slices/auth.slice'
import { selectUser } from '@/redux/selectors/auth.selector'
import { Link, useNavigate } from 'react-router-dom'

export function AppSidebarFooter() {
    const { theme, setTheme } = useTheme()

    const dispatch = useDispatch()

    const navigate = useNavigate()

    const user = useSelector(selectUser)

    const logout = async () => {
        try {
            await fetch(`${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.LOGOUT}`, {
                method: 'POST',
                credentials: 'include'
            })

            navigate(ROUTES.LOGIN)
            dispatch(setUser(null))
            dispatch(setStatus('unauthenticated'))
            dispatch(setAccessToken(null))
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <SidebarFooter className="border-t px-3 py-2">
            <div className="flex items-center justify-between gap-2">
                {/* User identity */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 hover:bg-muted">
                            <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={user?.avatar?.url} />
                                <AvatarFallback>
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>

                            <span className="max-w-27.5 truncate text-sm font-medium text-muted-foreground">{user?.name}</span>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="top"
                        align="end"
                        className="w-40">
                        <Link to={ROUTES.ADMIN.PROFILE}>
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={logout}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </SidebarFooter>
    )
}
