import { z } from "zod";
import { TaskPriority, TaskStatus } from "../types/types";

export const CreateTaskDto = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().datetime("Invalid date format"),
  priority: z.nativeEnum(TaskPriority),
  assignedToId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

export const UpdateTaskDto = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedToId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
