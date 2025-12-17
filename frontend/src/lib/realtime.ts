import type { Task } from "./types";

// Event types for real-time communication
export type RealtimeEvent =
  | { type: "task:created"; task: Task }
  | { type: "task:updated"; task: Task }
  | { type: "task:deleted"; taskId: string }
  | { type: "task:moved"; task: Task; fromColumnId: string; toColumnId: string }
  | { type: "user:joined"; userId: string; userName: string }
  | { type: "user:left"; userId: string }
  | {
      type: "init";
      activeUsers: { id: string; name: string; avatar?: string }[];
    };

export interface SocketNotification {
  taskId: string;
  taskTitle: string;
  assignedBy: string;
  assignedByName: string;
  createdAt: Date;
}
