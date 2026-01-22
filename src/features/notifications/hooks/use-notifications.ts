import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Notification {
    id: string;
    recipientId: string;
    type: "ISSUE_ASSIGNED" | "ISSUE_UPDATED" | "MENTION" | "PROJECT_INVITATION";
    message: string;
    referenceId?: string;
    read: boolean;
    createdAt: string;
}

export const getNotifications = async (): Promise<any> => {
    // Returns Page<Notification>, but for now just returning content?
    // Let's assume the API returns Page, so we need data.content
    const response = await apiClient.get<any>("/notifications");
    // Standard Spring Data Page response usually has `content`
    return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
    const response = await apiClient.get<number>("/notifications/unread-count");
    return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await apiClient.put("/notifications/read-all");
};

export const useNotifications = () => {
    return useQuery<any>({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        refetchInterval: 30000, // Poll every 30s
    });
};

export const useUnreadCount = () => {
    return useQuery<number>({
        queryKey: ["notifications", "unread-count"],
        queryFn: getUnreadCount,
        refetchInterval: 30000,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });
};
