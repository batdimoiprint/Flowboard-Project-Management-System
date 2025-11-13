import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import axiosInstance from '../components/apis/axiosInstance';

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