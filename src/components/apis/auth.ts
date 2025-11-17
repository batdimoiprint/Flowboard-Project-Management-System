import axiosInstance from './axiosInstance';
import { usersApi } from './users';

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
    userNameOrEmail: string;
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

            // The server will return an HttpOnly cookie containing the token.
            // Do not store tokens in JavaScript-accessible storage. We still persist
            // the user object locally for UI state.
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

    logout: async (): Promise<void> => {
        try {
            // Tell the backend to clear the auth cookie if such an endpoint exists
            await axiosInstance.post('/api/auth/logout');
        } catch (error) {
            // Even if the backend call fails, clear local UI state
            console.warn('Logout backend call failed', error);
        } finally {
            localStorage.removeItem('flowboard_user');
        }
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

    // We no longer expose token via JavaScript; return null for compatibility.
    getToken: (): string | null => {
        return null;
    },

    // Authentication is determined by the presence of a persisted user and the
    // HttpOnly cookie on the server side. For client-side checks, we rely on
    // the stored user object; more robust checks should call a protected
    // endpoint (usersApi.getCurrentUser) to validate the session.
    isAuthenticated: (): boolean => {
        const user = authApi.getCurrentUser();
        return !!user;
    },
    /**
     * Refreshes the currently-known user from the server using the HttpOnly cookie.
     * Returns the refreshed user or null.
     */
    refreshUserFromServer: async (): Promise<User | null> => {
        try {
            const user = await usersApi.getCurrentUser();
            localStorage.setItem('flowboard_user', JSON.stringify(user));
            return user;
        } catch {
            // On failure, do not clear existing locally stored user.
            return null;
        }
    },
};
