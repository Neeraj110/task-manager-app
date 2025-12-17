import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tasksApi,
  notificationsApi,
  authApi,
  dashboardApi,
  transformTaskData,
} from "@/lib/api";
import type { TaskData } from "@/lib/api";

// ============ Tasks Hooks ============

export function useTasks(params?: { status?: string; created?: string }) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const response = await tasksApi.getTasks(params);
      return {
        ...response,
        data: response.data?.map(transformTaskData) || [],
      };
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const response = await tasksApi.getTaskById(id);
      return {
        ...response,
        data: response.data ? transformTaskData(response.data) : undefined,
      };
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskData> }) =>
      tasksApi.updateTask(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tasksApi.updateTaskStatus(id, status),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ============ Notifications Hooks ============

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.getNotifications,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ============ Dashboard Hooks ============

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: dashboardApi.getRecentActivity,
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ["dashboard", "deadlines"],
    queryFn: dashboardApi.getUpcomingDeadlines,
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: ["dashboard", "overdue"],
    queryFn: dashboardApi.getOverdueTasks,
  });
}

// ============ Users Hooks ============

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: authApi.getAllUsers,
  });
}
