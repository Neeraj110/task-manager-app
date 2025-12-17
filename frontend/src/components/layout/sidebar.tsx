import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { CheckSquare, LayoutDashboard, Settings, LogOut } from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
    onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    const handleNavClick = () => {
        if (onNavigate) {
            onNavigate()
        }
    }

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 px-4 border-b border-border justify-between">
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">TaskFlow</span>
                </div>
                {/* Hide notification bell on mobile (when inside sheet) */}
                {!onNavigate && <NotificationBell />}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={handleNavClick}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* User Menu */}
            <div className="border-t border-border p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                                <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-medium">{user?.name}</span>
                                <span className="text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem asChild>
                            <Link to="/dashboard/settings" onClick={handleNavClick}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
