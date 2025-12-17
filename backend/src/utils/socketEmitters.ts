import {
  emitTaskUpdate,
  emitTaskCreated,
  emitTaskDeleted,
} from "../config/socket";
import { createAssignmentNotification } from "../services/NotificationService";


export const handleTaskCreated = async (
  task: any,
  createdBy?: { id: string; name: string }
) => {
  emitTaskCreated(task);

  // Send notification to assignee if task is assigned to someone else
  const assigneeId =
    task.assignedToId?._id?.toString() ||
    task.assignedToId?.toString();
  const creatorId =
    task.creatorId?._id?.toString() || task.creatorId?.toString();

  if (assigneeId && createdBy && assigneeId !== createdBy.id) {
    await createAssignmentNotification(
      assigneeId,
      task._id.toString(),
      task.title,
      createdBy.id,
      createdBy.name
    );
  }
};

export const handleTaskUpdated = async (
  task: any,
  previousAssignee?: string,
  updatedBy?: { id: string; name: string }
) => {
  emitTaskUpdate(task);

  // Check if assignee changed and send notification to new assignee
  const currentAssignee =
    task.assignedToId?._id?.toString() ||
    task.assignedToId?.toString();

  // Only notify if assignee changed and new assignee is different from who updated
  if (
    currentAssignee &&
    currentAssignee !== previousAssignee &&
    updatedBy &&
    currentAssignee !== updatedBy.id
  ) {
    await createAssignmentNotification(
      currentAssignee,
      task._id.toString(),
      task.title,
      updatedBy.id,
      updatedBy.name
    );
  }
};

export const handleTaskDeleted = (taskId: string) => {
  emitTaskDeleted(taskId);
};
