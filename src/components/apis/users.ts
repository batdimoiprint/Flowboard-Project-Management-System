import axiosInstance from './axiosInstance';
import type { User } from './auth';

export type { User };
export type UserUpdateRequest = Partial<Omit<User, 'id' | 'createdAt'>> & {
    password?: string;
};

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

    /**
     * Update a user by ID. Only provided fields will be applied (partial update / PATCH).
     * The backend validates and ignores immutable or invalid fields.
     */
    updateUser: async (userId: string, data: UserUpdateRequest): Promise<User> => {
        const response = await axiosInstance.patch<User>(`/api/users/${userId}`, data);
        return response.data;
    },
};
