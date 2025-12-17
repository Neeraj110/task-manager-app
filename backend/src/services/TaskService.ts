import { TaskRepository } from "../repositories/TaskRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CreateTaskInput, UpdateTaskInput } from "../dtos/task.dto";
import { ITask, TaskStatus } from "../types/types";
import { ForbiddenError, NotFoundError } from "../utils/errors";

export class TaskService {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
  }

  async createTask(data: CreateTaskInput, creatorId: string): Promise<ITask> {
    await this.userRepository.findByIdOrFail(data.assignedToId);

    // Create task
    const task = await this.taskRepository.create({
      ...data,
      creatorId,
    });

    return task;
  }

  async getTaskById(taskId: string, userId: string): Promise<ITask> {
    const task = await this.taskRepository.findByIdOrFail(taskId);

    this.verifyTaskAccess(task, userId);

    return task;
  }

  async getUserTasks(
    userId: string,
    status?: TaskStatus,
    priority?: string,
    sortBy?: string
  ): Promise<ITask[]> {
    if (status || priority || sortBy) {
      return await this.taskRepository.findWithFilters({
        userId,
        status,
        priority,
        sortBy,
        assignedOnly: false,
      });
    }
    return await this.taskRepository.findByAssignedUser(userId);
  }

  async getAllUserTasks(
    userId: string,
    status?: TaskStatus,
    priority?: string,
    sortBy?: string
  ): Promise<ITask[]> {
    // Get both created and assigned tasks, deduplicated
    const createdTasks = await this.taskRepository.findByCreator(userId);
    const assignedTasks = await this.taskRepository.findByAssignedUser(userId);

    // Combine and deduplicate by task ID
    const allTasksMap = new Map<string, ITask>();
    [...createdTasks, ...assignedTasks].forEach((task) => {
      allTasksMap.set(task._id.toString(), task);
    });

    let tasks = Array.from(allTasksMap.values());

    // Apply filters
    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }
    if (priority) {
      tasks = tasks.filter((task) => task.priority === priority);
    }

    // Apply sorting
    if (sortBy === "dueDate") {
      tasks.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    } else if (sortBy === "priority") {
      const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      tasks.sort(
        (a, b) =>
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
      );
    } else {
      // Default: sort by creation date, newest first
      tasks.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return tasks;
  }

  async getCreatedTasks(userId: string): Promise<ITask[]> {
    return await this.taskRepository.findByCreator(userId);
  }

  async getAllTasks(filters?: {
    status?: TaskStatus;
    assignedToId?: string;
    creatorId?: string;
  }): Promise<ITask[]> {
    return await this.taskRepository.findAll(filters);
  }

  async updateTask(
    taskId: string,
    data: UpdateTaskInput,
    userId: string
  ): Promise<ITask> {
    // Get task without populate for permission check
    const taskForPermission =
      await this.taskRepository.findByIdOrFailWithoutPopulate(taskId);

    // Allow both creator and assignee to update the task
    this.verifyTaskAccess(taskForPermission, userId);

    if (data.assignedToId) {
      await this.userRepository.findByIdOrFail(data.assignedToId);
    }

    return await this.taskRepository.update(taskId, data);
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    userId: string
  ): Promise<ITask> {
    // Get task without populate for permission check
    const taskForPermission =
      await this.taskRepository.findByIdOrFailWithoutPopulate(taskId);

    this.verifyTaskAccess(taskForPermission, userId);

    return await this.taskRepository.updateStatus(taskId, status);
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findByIdOrFail(taskId);

    // Handle both populated and non-populated creatorId
    const creatorId = (task.creatorId as any)?._id
      ? (task.creatorId as any)._id.toString()
      : task.creatorId.toString();

    if (creatorId !== userId) {
      throw new ForbiddenError("Only task creator can delete this task");
    }

    await this.taskRepository.delete(taskId);
  }

  private verifyTaskAccess(task: ITask, userId: string): void {
    // Extract IDs - handle both populated and non-populated tasks
    const creatorId = (task.creatorId as any)?._id
      ? (task.creatorId as any)._id.toString()
      : task.creatorId.toString();

    const assignedToId = (task.assignedToId as any)?._id
      ? (task.assignedToId as any)._id.toString()
      : task.assignedToId.toString();

    const isCreator = creatorId === userId;
    const isAssigned = assignedToId === userId;

    if (!isCreator && !isAssigned) {
      throw new ForbiddenError("Access denied to this task");
    }
  }
}
