import axiosInstance from './axiosInstance';
import type { User } from './auth';

export const usersApi = {
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosInstance.get<User>('/api/users/me');
        return response.data;
    },

    getUserById: async (userId: string): Promise<User> => {
        const response = await axiosInstance.get<User>(`/api/users/${userId}`);
        return response.data;
    },
};
