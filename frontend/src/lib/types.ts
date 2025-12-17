// Core types for the task manager application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: Date;
}

export interface WorkspaceMember {
  userId: string;
  user: User;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  columns: Column[];
  createdAt: Date;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  order: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "To Do" | "In Progress" | "Review" | "Completed";
  assignees: User[];
  dueDate?: Date;
  tags: string[];
  comments: Comment[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
