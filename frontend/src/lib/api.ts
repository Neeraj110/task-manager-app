// API configuration and helper functions
import type { Task } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | boolean | undefined>;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<
      ApiResponse<{ user: { _id: string; name: string; email: string } }>
    >("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    apiRequest<
      ApiResponse<{ user: { _id: string; name: string; email: string } }>
    >("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  getProfile: () =>
    apiRequest<
      ApiResponse<{
        _id: string;
        name: string;
        email: string;
        createdAt: string;
      }>
    >("/auth/profile"),

  updateProfile: (data: { name?: string; email?: string }) =>
    apiRequest<ApiResponse<{ _id: string; name: string; email: string }>>(
      "/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  logout: () =>
    apiRequest<ApiResponse<null>>("/auth/logout", { method: "POST" }),

  getAllUsers: () =>
    apiRequest<
      ApiResponse<
        Array<{ _id: string; name: string; email: string; createdAt: string }>
      >
    >("/auth/users"),
};

// Tasks API
export interface TaskData {
  _id: string;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Review" | "Completed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate?: string;
  assignedToId?: string | { _id: string; name: string; email: string };
  creatorId?: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

// Transform TaskData to Task
export function transformTaskData(taskData: TaskData): Task {
  // Handle populated assignedToId
  const assignee =
    typeof taskData.assignedToId === "object" && taskData.assignedToId
      ? {
          id: taskData.assignedToId._id,
          name: taskData.assignedToId.name,
          email: taskData.assignedToId.email,
          createdAt: new Date(),
        }
      : undefined;

  return {
    id: taskData._id,
    columnId: taskData.status, // Map status to columnId for now
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    status: taskData.status,
    assignees: assignee ? [assignee] : [],
    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    tags: [], // Backend doesn't have tags yet
    comments: [], // Backend doesn't have comments yet
    order: 0, // Backend doesn't have order yet
    createdAt: new Date(taskData.createdAt),
    updatedAt: new Date(taskData.updatedAt),
  };
}

export const tasksApi = {
  getTasks: (params?: { status?: string; created?: string }) =>
    apiRequest<ApiResponse<TaskData[]>>("/tasks", { params }),

  getTaskById: (id: string) =>
    apiRequest<ApiResponse<TaskData>>(`/tasks/${id}`),

  createTask: (data: {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    dueDate: string;
    assignedToId: string;
  }) =>
    apiRequest<ApiResponse<TaskData>>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTask: (id: string, data: Partial<TaskData>) =>
    apiRequest<ApiResponse<TaskData>>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateTaskStatus: (id: string, status: string) =>
    apiRequest<ApiResponse<TaskData>>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteTask: (id: string) =>
    apiRequest<ApiResponse<null>>(`/tasks/${id}`, { method: "DELETE" }),
};

// Notifications API
export interface NotificationData {
  _id: string;
  user: string;
  type: "task_assigned" | "task_updated" | "task_completed" | "mention";
  message: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: () =>
    apiRequest<ApiResponse<NotificationData[]>>("/notifications"),

  markAsRead: (id: string) =>
    apiRequest<ApiResponse<null>>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiRequest<ApiResponse<null>>("/notifications/read-all", {
      method: "PATCH",
    }),
};

// Dashboard API
export interface DashboardStats {
  totalTasks: number;
  inProgress: number;
  urgent: number;
  teamMembers: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  task: string;
  user: string;
  time: string;
  createdAt: string;
}

export interface UpcomingDeadline {
  id: string;
  task: string;
  due: string;
  priority: string;
  dueDate: string;
}

export const dashboardApi = {
  getStats: () => apiRequest<ApiResponse<DashboardStats>>("/dashboard/stats"),

  getRecentActivity: () =>
    apiRequest<ApiResponse<{ activities: RecentActivity[] }>>(
      "/dashboard/activity"
    ),

  getUpcomingDeadlines: () =>
    apiRequest<ApiResponse<{ deadlines: UpcomingDeadline[] }>>(
      "/dashboard/deadlines"
    ),

  getOverdueTasks: () =>
    apiRequest<ApiResponse<{ tasks: TaskData[]; count: number }>>(
      "/dashboard/overdue"
    ),
};

// Comments API
export interface CommentData {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export const commentsApi = {
  getComments: (taskId: string) =>
    apiRequest<ApiResponse<{ comments: CommentData[] }>>("/comments", {
      params: { taskId },
    }),

  createComment: (data: { taskId: string; content: string }) =>
    apiRequest<ApiResponse<CommentData>>("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteComment: (id: string) =>
    apiRequest<ApiResponse<null>>(`/comments/${id}`, {
      method: "DELETE",
    }),
};
