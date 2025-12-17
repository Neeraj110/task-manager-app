import Notification, { INotification } from "../models/Notification";
import { emitAssignmentNotification } from "../config/socket";

interface CreateNotificationParams {
  userId: string;
  type: "assignment" | "update" | "mention" | "deadline";
  title: string;
  message: string;
  taskId?: string;
}

export const createNotification = async (params: CreateNotificationParams): Promise<INotification> => {
  const notification = await Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    taskId: params.taskId,
  });

  return notification;
};

export const createAssignmentNotification = async (
  assigneeId: string,
  taskId: string,
  taskTitle: string,
  assignedById: string,
  assignedByName: string
): Promise<void> => {
  // Create persistent notification
  await createNotification({
    userId: assigneeId,
    type: "assignment",
    title: "New Task Assigned",
    message: `${assignedByName} assigned you to task: "${taskTitle}"`,
    taskId,
  });

  // Emit real-time notification
  emitAssignmentNotification(assigneeId, {
    taskId,
    taskTitle,
    assignedBy: assignedById,
    assignedByName,
    createdAt: new Date(),
  });
};

export const getUserNotifications = async (userId: string, limit = 20): Promise<INotification[]> => {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("taskId", "title status");
};

export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<INotification | null> => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany({ userId, read: false }, { read: true });
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ userId, read: false });
};
