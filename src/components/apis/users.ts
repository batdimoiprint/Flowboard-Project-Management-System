import axiosInstance from './axiosInstance';
import type { User } from './auth';

export const usersApi = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await axiosInstance.get<User[]>('/api/users');
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await axiosInstance.get<User>('/api/users/me');
        return response.data;
    },

    getUserById: async (userId: string): Promise<User> => {
        const response = await axiosInstance.get<User>(`/api/users/${userId}`);
        return response.data;
    },
};
