import axiosInstance from './axiosInstance';

export interface User {
    id: string;
    userName: string;
    lastName: string;
    firstName: string;
    middleName: string;
    contactNumber: string;
    birthDate: string;
    userIMG: string | null;
    email: string;
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegisterRequest {
    userName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    contactNumber: string;
    birthDate: string;
    userIMG: string | null;
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const response = await axiosInstance.post<LoginResponse>('/api/auth/login', credentials);
            
            // Store token and user in localStorage
            if (response.data.token) {
                localStorage.setItem('flowboard_token', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('flowboard_user', JSON.stringify(response.data.user));
            }
            
            return response.data;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                throw new Error(axiosError.response?.data?.message || 'Login failed');
            }
            throw new Error('An unexpected error occurred during login');
        }
    },

    register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
        try {
            const response = await axiosInstance.post<RegisterResponse>('/api/auth/register', userData);
            return response.data;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                throw new Error(axiosError.response?.data?.message || 'Registration failed');
            }
            throw new Error('An unexpected error occurred during registration');
        }
    },

    logout: (): void => {
        localStorage.removeItem('flowboard_token');
        localStorage.removeItem('flowboard_user');
        localStorage.removeItem('token'); // Backwards compatibility
    },

    getCurrentUser: (): User | null => {
        try {
            const storedUser = localStorage.getItem('flowboard_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            return null;
        }
    },

    getToken: (): string | null => {
        return localStorage.getItem('flowboard_token') || localStorage.getItem('token');
    },

    isAuthenticated: (): boolean => {
        const token = authApi.getToken();
        const user = authApi.getCurrentUser();
        return !!token && !!user;
    },
};
