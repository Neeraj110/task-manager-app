import { Request, Response } from "express";
import * as notificationService from "../services/NotificationService";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id || (req as any).user.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const notifications = await notificationService.getUserNotifications(userId, limit);
    const unreadCount = await notificationService.getUnreadCount(userId);
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id || (req as any).user.userId;
    const { notificationId } = req.params;
    
    const notification = await notificationService.markNotificationAsRead(notificationId, userId);
    
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id || (req as any).user.userId;
    
    await notificationService.markAllNotificationsAsRead(userId);
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
