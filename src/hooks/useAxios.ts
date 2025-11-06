import { useState, useCallback } from 'react';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

interface UseAxiosResult<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    fetchData: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
}

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
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, error, loading, fetchData };
}