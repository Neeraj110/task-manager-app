import { Request, Response, NextFunction } from "express";
import { TaskRepository } from "../repositories/TaskRepository";
import { UserRepository } from "../repositories/UserRepository";
import { TaskStatus } from "../types/types";

export class DashboardController {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
  }

  getStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      // Get all tasks for the user (created or assigned)
      const createdTasks = await this.taskRepository.findByCreator(userId);
      const assignedTasks = await this.taskRepository.findByAssignedUser(
        userId
      );

      // Combine and deduplicate tasks
      const allTasksMap = new Map();
      [...createdTasks, ...assignedTasks].forEach((task) => {
        allTasksMap.set(task._id.toString(), task);
      });
      const allTasks = Array.from(allTasksMap.values());

      // Calculate stats
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(
        (t) => t.status === TaskStatus.COMPLETED
      ).length;
      const inProgress = allTasks.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS
      ).length;
      const urgent = allTasks.filter((t) => t.priority === "Urgent").length;

      // Get total users count
      const allUsers = await this.userRepository.findAll();
      const teamMembers = allUsers.length;

      res.status(200).json({
        success: true,
        data: {
          totalTasks,
          completedTasks,
          inProgress,
          urgent,
          teamMembers,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getRecentActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      // Get recent tasks (created or assigned to user)
      const createdTasks = await this.taskRepository.findByCreator(userId);
      const assignedTasks = await this.taskRepository.findByAssignedUser(
        userId
      );

      // Combine and sort by createdAt
      const allTasks = [...createdTasks, ...assignedTasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5); // Get last 5 activities

      const activities = allTasks.map((task: any) => {
        const creatorName = task.creatorId?.name || "Someone";
        const assigneeName = task.assignedToId?.name || "Someone";

        const creatorIdString =
          task.creatorId?._id?.toString() || task.creatorId?.toString();
        const assignedToIdString =
          task.assignedToId?._id?.toString() || task.assignedToId?.toString();

        // Determine who performed the action and what action was performed
        let action = "";
        let userName = "";

        if (task.status === TaskStatus.COMPLETED) {
          // Completed by assignee
          action = "completed";
          userName = assigneeName;
        } else if (task.status === TaskStatus.IN_PROGRESS) {
          // Started by assignee
          action = "started working on";
          userName = assigneeName;
        } else {
          // Created by creator
          action = "created";
          userName = creatorName;
        }

        const timeAgo = this.getTimeAgo(new Date(task.updatedAt));

        return {
          id: task._id.toString(),
          user: userName,
          action,
          task: task.title,
          time: timeAgo,
        };
      });

      res.status(200).json({
        success: true,
        data: { activities },
      });
    } catch (error) {
      next(error);
    }
  };

  getUpcomingDeadlines = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      // Get tasks assigned to user that are not completed
      const assignedTasks = await this.taskRepository.findByAssignedUser(
        userId
      );

      // Filter incomplete tasks with due dates and sort by due date
      const upcomingTasks = assignedTasks
        .filter(
          (task) =>
            task.status !== TaskStatus.COMPLETED &&
            task.dueDate &&
            new Date(task.dueDate) > new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
        )
        .slice(0, 5); // Get next 5 deadlines

      const deadlines = upcomingTasks.map((task) => ({
        id: task._id.toString(),
        task: task.title,
        due: this.formatDueDate(new Date(task.dueDate!)),
        priority: task.priority,
        status: task.status,
      }));

      res.status(200).json({
        success: true,
        data: { deadlines },
      });
    } catch (error) {
      next(error);
    }
  };

  getOverdueTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      // Get tasks assigned to user
      const assignedTasks = await this.taskRepository.findByAssignedUser(
        userId
      );

      // Filter overdue tasks (not completed and past due date)
      const now = new Date();
      const overdueTasks = assignedTasks
        .filter(
          (task) =>
            task.status !== TaskStatus.COMPLETED &&
            task.dueDate &&
            new Date(task.dueDate) < now
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
        );

      const tasks = overdueTasks.map((task: any) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedToId?.name || "Unassigned",
        daysOverdue: Math.floor(
          (now.getTime() - new Date(task.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));

      res.status(200).json({
        success: true,
        data: { tasks, count: tasks.length },
      });
    } catch (error) {
      next(error);
    }
  };

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  private formatDueDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "today";
    if (isTomorrow) return "tomorrow";

    const daysUntil = Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 7) return `in ${daysUntil} days`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}
