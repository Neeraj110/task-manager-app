import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/TaskService";
import { CreateTaskInput, UpdateTaskInput } from "../dtos/task.dto";
import { TaskStatus } from "../types/types";
import {
  handleTaskCreated,
  handleTaskUpdated,
  handleTaskDeleted,
} from "../utils/socketEmitters";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  createTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateTaskInput = req.body;
      const creatorId = req.user!._id.toString();

      const task = await this.taskService.createTask(data, creatorId);

      // Emit socket event and send notification to assignee
      await handleTaskCreated(task, {
        id: req.user!._id.toString(),
        name: req.user!.name,
      });

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const { status, created, priority, sortBy } = req.query;

      let tasks;
      if (created === "true") {
        // Only tasks created by user
        tasks = await this.taskService.getCreatedTasks(userId);
      } else {
        // Get ALL tasks (both created and assigned) for "My Tasks" view
        tasks = await this.taskService.getAllUserTasks(
          userId,
          status as TaskStatus | undefined,
          priority as string | undefined,
          sortBy as string | undefined
        );
      }

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!._id.toString();

      const task = await this.taskService.getTaskById(id, userId);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateTaskInput = req.body;
      const userId = req.user!._id.toString();

      // Get previous assignee before update
      const existingTask = await this.taskService.getTaskById(id, userId);
      const previousAssignee =
        (existingTask as any).assignedToId?._id?.toString() ||
        (existingTask as any).assignedToId?.toString();

      const task = await this.taskService.updateTask(id, data, userId);

      await handleTaskUpdated(task, previousAssignee, {
        id: req.user!._id.toString(),
        name: req.user!.name,
      });

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTaskStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!._id.toString();

      const existingTask = await this.taskService.getTaskById(id, userId);
      const previousAssignee =
        (existingTask as any).assignee?.toString() ||
        (existingTask as any).assignedTo?.toString();

      const task = await this.taskService.updateTaskStatus(
        id,
        status as TaskStatus,
        userId
      );

      await handleTaskUpdated(task, previousAssignee, {
        id: req.user!._id.toString(),
        name: req.user!.name,
      });

      res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!._id.toString();

      const task = await this.taskService.deleteTask(id, userId);

      handleTaskDeleted(id);

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
