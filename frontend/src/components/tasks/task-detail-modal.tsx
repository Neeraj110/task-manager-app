import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calendar, Tag, Loader2, Trash2, CheckCircle2, User } from "lucide-react"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useUpdateTask, useDeleteTask, useUsers } from "@/hooks/use-queries"
import { Avatar } from "@/components/ui/avatar"
import { toast } from "sonner"

interface TaskDetailModalProps {
    task: Task
    onClose: () => void
    onUpdate: (task?: Task, deleted?: boolean) => void
}

const priorityColors: Record<string, string> = {
    Low: "bg-emerald-500/10 text-emerald-600",
    Medium: "bg-amber-500/10 text-amber-600",
    High: "bg-orange-500/10 text-orange-600",
    Urgent: "bg-destructive/10 text-destructive",
}

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
    const updateTaskMutation = useUpdateTask()
    const deleteTaskMutation = useDeleteTask()
    const { data: usersData, isLoading: isLoadingUsers } = useUsers()
    const users = usersData?.data || []

    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || "")
    const [priority, setPriority] = useState(task.priority)
    const [status, setStatus] = useState(task.status)
    const [assignedToId, setAssignedToId] = useState(task.assignees?.[0]?.id || "")

    const isCompleted = task.status === "Completed"

    const handleUpdate = async () => {
        try {
            const updateData: Record<string, string> = {
                title,
                description,
                priority,
                status,
            }

            // Only include assignedToId if it changed
            if (assignedToId && assignedToId !== task.assignees?.[0]?.id) {
                updateData.assignedToId = assignedToId
            }

            // Only include dueDate if it exists
            if (task.dueDate) {
                updateData.dueDate = new Date(task.dueDate).toISOString()
            }

            await updateTaskMutation.mutateAsync({
                id: task.id,
                data: updateData,
            })
            toast.success("Task updated successfully")
            onUpdate()
            onClose()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update task"
            toast.error(errorMessage)
            console.error("Failed to update task:", error)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return

        try {
            await deleteTaskMutation.mutateAsync(task.id)
            toast.success("Task deleted successfully")
            onUpdate(task, true)
            onClose()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete task"
            toast.error(errorMessage)
            console.error("Failed to delete task:", error)
        }
    }

    const formattedDate = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
        : null

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="sr-only">Task Details</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                            placeholder="Task title"
                        />
                    </div>

                    {/* Completion status badge if completed */}
                    {isCompleted && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 w-fit">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                        </Badge>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <Select value={priority} onValueChange={(v: "Low" | "Medium" | "High" | "Urgent") => setPriority(v)}>
                                <SelectTrigger className="h-7 w-auto border-none shadow-none">
                                    <Badge className={cn("text-xs", priorityColors[priority])}>{priority}</Badge>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">Status:</Label>
                            <Select value={status} onValueChange={(v: "To Do" | "In Progress" | "Review" | "Completed") => setStatus(v)}>
                                <SelectTrigger className="h-7 w-auto border-none shadow-none">
                                    <span className="text-xs">{status}</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="To Do">To Do</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Review">Review</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formattedDate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formattedDate}</span>
                            </div>
                        )}
                    </div>

                    {/* Assignee */}
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Assigned To</Label>
                        <Select value={assignedToId} onValueChange={setAssignedToId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user"} />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((u) => (
                                    <SelectItem key={u._id} value={u._id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5">
                                                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                    <User className="h-3 w-3" />
                                                </div>
                                            </Avatar>
                                            <span>{u.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <Separator />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteTaskMutation.isPending}>
                        {deleteTaskMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updateTaskMutation.isPending}>
                            {updateTaskMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
