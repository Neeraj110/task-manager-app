import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Calendar, User } from "lucide-react"
import { useTasks } from "@/hooks/use-queries"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskDetailModal } from "@/components/tasks/task-detail-modal"
import type { Task } from "@/lib/types"

export default function TasksPage() {
    const { data: tasksData, isLoading, refetch, error } = useTasks()
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    // Debug logging
    useEffect(() => {
        console.log('Tasks Data:', tasksData)
        console.log('Tasks:', tasksData?.data)
        console.log('Is Loading:', isLoading)
        console.log('Error:', error)
    }, [tasksData, isLoading, error])

    const tasks = tasksData?.data || []

    const tasksByStatus = {
        "To Do": tasks.filter((t: Task) => t.status === "To Do"),
        "In Progress": tasks.filter((t: Task) => t.status === "In Progress"),
        "Review": tasks.filter((t: Task) => t.status === "Review"),
        "Completed": tasks.filter((t: Task) => t.status === "Completed"),
    }

    const priorityColors: Record<string, string> = {
        Low: "bg-emerald-500/10 text-emerald-600",
        Medium: "bg-amber-500/10 text-amber-600",
        High: "bg-orange-500/10 text-orange-600",
        Urgent: "bg-destructive/10 text-destructive",
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Tasks</h1>
                    <p className="text-muted-foreground mt-1">View and manage all your tasks</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-3 text-muted-foreground">Loading tasks...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-destructive mb-2">Error loading tasks</p>
                    <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
                    <Button onClick={() => refetch()} className="mt-4">Retry</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                        <Card key={status}>
                            <CardHeader>
                                <CardTitle className="text-lg">{status}</CardTitle>
                                <CardDescription>{statusTasks.length} tasks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {statusTasks.map((task: Task) => (
                                    <div
                                        key={task.id}
                                        className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <h3 className="font-medium mb-2">{task.title}</h3>
                                        <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                                            <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            )}
                                            {task.assignees.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {task.assignees.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {statusTasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {createDialogOpen && (
                <CreateTaskDialog
                    onClose={() => setCreateDialogOpen(false)}
                    onTaskCreated={() => {
                        setCreateDialogOpen(false)
                        refetch()
                    }}
                />
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={() => {
                        setSelectedTask(null)
                        refetch()
                    }}
                />
            )}
        </div>
    )
}
