import { Task } from "../models/Task";
import { ITask, TaskStatus } from "../types/types";
import { NotFoundError } from "../utils/errors";
import { CreateTaskInput, UpdateTaskInput } from "../dtos/task.dto";

export class TaskRepository {
  async create(
    taskData: CreateTaskInput & { creatorId: string }
  ): Promise<ITask> {
    const task = new Task({
      ...taskData,
      dueDate: new Date(taskData.dueDate),
      status: TaskStatus.TODO,
    });
    return await task.save();
  }

  async findById(taskId: string): Promise<ITask | null> {
    return await Task.findById(taskId)
      .populate("creatorId", "name email")
      .populate("assignedToId", "name email");
  }

  async findByIdWithoutPopulate(taskId: string): Promise<ITask | null> {
    return await Task.findById(taskId);
  }

  async findByIdOrFail(taskId: string): Promise<ITask> {
    const task = await this.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    return task;
  }

  async findByIdOrFailWithoutPopulate(taskId: string): Promise<ITask> {
    const task = await this.findByIdWithoutPopulate(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    return task;
  }

  async update(taskId: string, updateData: UpdateTaskInput): Promise<ITask> {
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        ...updateData,
        ...(updateData.dueDate && { dueDate: new Date(updateData.dueDate) }),
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("creatorId", "name email")
      .populate("assignedToId", "name email");

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return task;
  }

  async delete(taskId: string): Promise<void> {
    const result = await Task.findByIdAndDelete(taskId);
    if (!result) {
      throw new NotFoundError("Task not found");
    }
  }

  async findByAssignedUser(userId: string): Promise<ITask[]> {
    return await Task.find({ assignedToId: userId })
      .populate("creatorId", "name email")
      .populate("assignedToId", "name email")
      .sort({ dueDate: 1 });
  }

  async findWithFilters(params: {
    userId?: string;
    status?: TaskStatus;
    priority?: string;
    sortBy?: string;
    assignedOnly?: boolean;
    createdOnly?: boolean;
  }): Promise<ITask[]> {
    const query: any = {};

    // Filter by user - either assigned or created
    if (params.userId) {
      if (params.assignedOnly) {
        query.assignedToId = params.userId;
      } else if (params.createdOnly) {
        query.creatorId = params.userId;
      } else {
        query.$or = [
          { assignedToId: params.userId },
          { creatorId: params.userId },
        ];
      }
    }

    // Filter by status
    if (params.status) {
      query.status = params.status;
    }

    // Filter by priority
    if (params.priority) {
      query.priority = params.priority;
    }

    // Build sort object
    const sort: any = {};
    if (params.sortBy === "dueDate") {
      sort.dueDate = 1; // Ascending (earliest first)
    } else if (params.sortBy === "priority") {
      // Custom priority order: Urgent > High > Medium > Low
      sort.priority = -1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    return await Task.find(query)
      .populate("creatorId", "name email")
      .populate("assignedToId", "name email")
      .sort(sort);
  }

  async findByCreator(userId: string): Promise<ITask[]> {
    return await Task.find({ creatorId: userId })
      .populate("creatorId", "name email")
      .populate("assignedToId", "name email")
      .sort({ createdAt: -1 });
  }

  async findAll(filters?: {
    status?: TaskStatus;
    assignedToId?: string;
    creatorId?: string;
  }): Promise<ITask[]> {
    const query: any = {};

    if (filters?.status) query.status = filters.status;
    if (filters?.assignedToId) query.assignedToId = filters.assignedToId;
    if (filters?.creatorId) query.creatorId = filters.creatorId;

    return await Task.find(query)
      .populate("creatorId", "name email")
      .populate("assignedToId", "name email")
      .sort({ dueDate: 1 });
  }

  async updateStatus(taskId: string, status: TaskStatus): Promise<ITask> {
    return await this.update(taskId, { status });
  }
}
