import { useEffect, useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Loader2, Menu, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { NotificationBell } from "@/components/notifications/notification-bell"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export function DashboardLayout() {
    const { isAuthenticated, isLoading } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/")
        }
    }, [isLoading, isAuthenticated, navigate])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Sheet */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <VisuallyHidden.Root>
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </VisuallyHidden.Root>
                    <Sidebar onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header - visible only on mobile */}
                <header className="md:hidden flex h-14 items-center justify-between border-b border-border bg-card px-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-primary" />
                            <span className="font-semibold">TaskFlow</span>
                        </div>
                    </div>
                    <NotificationBell />
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
