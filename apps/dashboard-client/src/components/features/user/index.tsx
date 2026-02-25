import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, Sun, Moon, User2 } from 'lucide-react'
import { useTheme } from '../theme-provider'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '@/redux/selectors/auth.selector'
import constants, { APIS, ROUTES } from '@/constants'
import { useNavigate } from 'react-router-dom'
import { setAccessToken, setStatus, setUser } from '@/redux/slices/auth.slice'

export default function User() {
    const { theme, setTheme } = useTheme()
    const [open, setOpen] = useState(false)

    const dispatch = useDispatch()

    const navigate = useNavigate()

    const user = useSelector(selectUser)

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    const onLogout = async () => {
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
        <DropdownMenu
            open={open}
            onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar?.url ?? undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-72 p-0 overflow-hidden rounded-xl">
                {/* Top Profile Box */}
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-6 bg-muted/40">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatar?.url ?? undefined} />
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="text-center space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                <DropdownMenuSeparator />

                {/* Theme Toggle */}
                <DropdownMenuItem
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="cursor-pointer">
                    {theme === 'dark' ? (
                        <>
                            <Sun className="mr-2 h-4 w-4" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon className="mr-2 h-4 w-4" />
                            Dark Mode
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Profile */}
                <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer">
                    <User2 className="mr-2 h-4 w-4" />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
