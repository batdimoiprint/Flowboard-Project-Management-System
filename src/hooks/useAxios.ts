import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ,
});

// Add request interceptor to include JWT token in headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('flowboard_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface UseAxiosResult<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    fetchData: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAxios<T = any>(): UseAxiosResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (url: string, config: AxiosRequestConfig = {}) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await axiosInstance({
                url,
                ...config,
            });
            setData(response.data);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || err.message || 'Unknown error');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, error, loading, fetchData };
}