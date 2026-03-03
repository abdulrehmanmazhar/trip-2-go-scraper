import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import { Camera } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectUser } from '@/redux/selectors/auth.selector'

export default function Profile() {
    const user = useSelector(selectUser)!
    // const onUpdateProfile = async () => {}
    // const onChangePassword = async () => {}
    // const onUpdateAvatar = async () => {}

    const [name, setName] = useState(user.name)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const initials = user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    return (
        <div className="min-h-screen bg-background">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
                        <p className="text-muted-foreground text-sm">Manage your account settings and personal information.</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* ───── Personal Info Section ───── */}
                    <section className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Personal Information</h2>
                            <p className="text-sm text-muted-foreground mt-1">Update your name and profile picture.</p>
                        </div>

                        {/* Avatar */}
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.avatar?.url ?? undefined} />
                                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                                </Avatar>

                                <label className="absolute -bottom-1 -right-1 cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={() => {
                                            // if (e.target.files?.[0]) {
                                            //     onUpdateAvatar(e.target.files[0])
                                            // }
                                        }}
                                    />
                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                                        <Camera className="h-4 w-4" />
                                    </div>
                                </label>
                            </div>

                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() => {}}
                                className="h-11 px-8">
                                Save Changes
                            </Button>
                        </div>
                    </section>

                    {/* ───── Security Section ───── */}
                    <section className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Security</h2>
                            <p className="text-sm text-muted-foreground mt-1">Update your password to keep your account secure.</p>
                        </div>

                        <div className="grid gap-6 mt-12">
                            <div className="grid gap-3">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="h-11"
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    // onChangePassword({
                                    //     currentPassword,
                                    //     newPassword
                                    // })
                                    {}
                                }
                                className="h-11 px-8">
                                Update Password
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
