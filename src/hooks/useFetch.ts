
import { useState, useCallback } from 'react';
import { AppError } from '@/lib/error/AppError';
import { withRetry } from '@/lib/utils/retry';

interface FetchOptions extends RequestInit {
    retry?: boolean;
}

interface FetchState<T> {
    data: T | null;
    error: AppError | null;
    isLoading: boolean;
}

export function useFetch<T = any>() {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        error: null,
        isLoading: false
    });

    const execute = useCallback(async (url: string, options?: FetchOptions) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const fetchData = async () => {
            const response = await fetch(url, options);
            if (!response.ok) {
                let errorMessage = 'An error occurred';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || response.statusText;
                } catch {
                    errorMessage = response.statusText;
                }
                throw new AppError(errorMessage, 'INTERNAL_ERROR', response.status);
            }
            return await response.json();
        };

        try {
            const data = options?.retry
                ? await withRetry(() => fetchData())
                : await fetchData();

            setState({ data, error: null, isLoading: false });
            return data;
        } catch (error: any) {
            const appError = error instanceof AppError
                ? error
                : new AppError(error.message || 'Unknown Error', 'INTERNAL_ERROR');

            setState({ data: null, error: appError, isLoading: false });
            throw appError;
        }
    }, []);

    return { ...state, execute };
}
