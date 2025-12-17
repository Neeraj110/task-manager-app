import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useSocket } from '@/contexts/socket-context'
import { useNotifications, useMarkAllNotificationsAsRead } from '@/hooks/use-queries'
import { formatDistanceToNow } from 'date-fns'
import type { NotificationData } from '@/lib/api'

export function NotificationBell() {
    const { notifications: socketNotifications, clearNotifications, isConnected } = useSocket()
    const { data: dbNotificationsData, refetch: refetchNotifications } = useNotifications()
    const markAllAsRead = useMarkAllNotificationsAsRead()
    const [open, setOpen] = useState(false)

    // Combine socket and database notifications
    const dbNotifications: NotificationData[] = dbNotificationsData?.data || []
    const unreadDbNotifications = dbNotifications.filter((n) => !n.read)

    // Total unread count (socket notifications + unread db notifications)
    const unreadCount = socketNotifications.length + unreadDbNotifications.length

    // Refetch notifications when popover opens
    useEffect(() => {
        if (open) {
            refetchNotifications()
        }
    }, [open, refetchNotifications])

    const handleClearAll = async () => {
        clearNotifications()
        await markAllAsRead.mutateAsync()
        refetchNotifications()
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Notifications</h3>
                        {isConnected ? (
                            <div className="h-2 w-2 rounded-full bg-green-500" title="Connected" />
                        ) : (
                            <div className="h-2 w-2 rounded-full bg-gray-400" title="Disconnected" />
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-xs"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {socketNotifications.length === 0 && unreadDbNotifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {/* Real-time socket notifications */}
                            {socketNotifications.map((notification, index) => (
                                <div key={`socket-${index}`} className="p-4 hover:bg-accent transition-colors bg-primary/5">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">New Task Assignment</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                <span className="font-medium">{notification.assignedByName}</span> assigned
                                                you to: {notification.taskTitle}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                            {/* Database notifications */}
                            {unreadDbNotifications.map((notification) => (
                                <div key={notification._id} className="p-4 hover:bg-accent transition-colors">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {notification.type === 'task_assigned' ? 'Task Assigned' :
                                                    notification.type === 'task_updated' ? 'Task Updated' :
                                                        notification.type === 'task_completed' ? 'Task Completed' :
                                                            notification.type === 'mention' ? 'Mentioned' : 'Notification'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
