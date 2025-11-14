import axiosInstance from './axiosInstance';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    isRead: boolean;
    createdAt: string;
    projectId?: string;
    actorId?: string;
}

export interface CreateNotificationRequest {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'success' | 'error';
    projectId?: string;
    actorId?: string;
}

export const notificationsApi = {
    getAll: async (): Promise<Notification[]> => {
        const response = await axiosInstance.get<Notification[]>('/api/notifications');
        return response.data;
    },

    getUnread: async (): Promise<Notification[]> => {
        const response = await axiosInstance.get<Notification[]>('/api/notifications?isRead=false');
        return response.data;
    },

    create: async (payload: CreateNotificationRequest): Promise<Notification> => {
        const response = await axiosInstance.post<Notification>('/api/notifications', payload);
        return response.data;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
    },

    delete: async (notificationId: string): Promise<void> => {
        await axiosInstance.delete(`/api/notifications/${notificationId}`);
    },
};
