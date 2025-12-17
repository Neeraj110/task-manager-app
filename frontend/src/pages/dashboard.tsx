import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, Users, Loader2, AlertTriangle } from "lucide-react"
import { useDashboardStats, useRecentActivity, useUpcomingDeadlines, useOverdueTasks } from "@/hooks/use-queries"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"

export default function DashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { data: statsData, isLoading: statsLoading } = useDashboardStats()
    const { data: activityData, isLoading: activityLoading } = useRecentActivity()
    const { data: deadlinesData, isLoading: deadlinesLoading } = useUpcomingDeadlines()
    const { data: overdueData, isLoading: overdueLoading } = useOverdueTasks()

    const stats = statsData?.data ? [
        { name: "Total Tasks", value: String(statsData.data.totalTasks), icon: CheckCircle2, color: "text-primary" },
        { name: "In Progress", value: String(statsData.data.inProgress), icon: Clock, color: "text-amber-500" },
        { name: "Urgent", value: String(statsData.data.urgent), icon: AlertCircle, color: "text-destructive" },
        { name: "Team Members", value: String(statsData.data.teamMembers), icon: Users, color: "text-emerald-500" },
    ] : []

    const activities = activityData?.data?.activities || []
    const deadlines = deadlinesData?.data?.deadlines || []
    const overdueTasks = overdueData?.data?.tasks || []

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
                <p className="text-muted-foreground mt-1">Here's what's happening with your projects today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {statsLoading ? (
                    <div className="col-span-4 flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    stats.map((stat) => (
                        <Card key={stat.name}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your team</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activityLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : activities.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                                        <div>
                                            <span className="font-medium">{activity.user}</span>{" "}
                                            <span className="text-muted-foreground">{activity.action}</span>{" "}
                                            <span className="font-medium">{activity.task}</span>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                        <CardDescription>Tasks due soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {deadlinesLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : deadlines.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No upcoming deadlines</p>
                        ) : (
                            <div className="space-y-4">
                                {deadlines.map((deadline) => (
                                    <div key={deadline.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-sm">{deadline.task}</p>
                                            <p className="text-xs text-muted-foreground">Due {deadline.due}</p>
                                        </div>
                                        <Badge variant={deadline.priority === "Urgent" ? "destructive" : "secondary"}>
                                            {deadline.priority}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-destructive/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-destructive">Overdue Tasks</CardTitle>
                        </div>
                        <CardDescription>Tasks past their due date</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {overdueLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-destructive" />
                            </div>
                        ) : overdueTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No overdue tasks! 🎉</p>
                        ) : (
                            <div className="space-y-4">
                                {overdueTasks.slice(0, 5).map((task: any) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                                        onClick={() => navigate('/board')}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{task.title}</p>
                                            <p className="text-xs text-destructive">{task.daysOverdue} {task.daysOverdue === 1 ? 'day' : 'days'} overdue</p>
                                        </div>
                                        <Badge variant="destructive">{task.priority}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
