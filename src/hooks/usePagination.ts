import { useState, useEffect, useCallback } from 'react';
import { PagedResult, DEFAULT_PAGE_SIZE } from '../types';

interface UsePaginationOptions {
    initialPageSize?: number;
    autoFetch?: boolean;
}

export function usePagination<T>(
    fetchFunction: (pageNumber: number, pageSize: number) => Promise<PagedResult<T>>,
    options: UsePaginationOptions = {}
) {
    const { initialPageSize = DEFAULT_PAGE_SIZE, autoFetch = true } = options;
    
    const [data, setData] = useState<PagedResult<T> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const fetchData = useCallback(async (page: number = pageNumber, size: number = pageSize) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction(page, size);
            setData(result);
        } catch (err) {
            setError(err as Error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, pageNumber, pageSize]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [pageNumber, pageSize]);

    const goToPage = useCallback((page: number) => {
        setPageNumber(page);
    }, []);

    const nextPage = useCallback(() => {
        if (data?.hasNextPage) {
            setPageNumber(prev => prev + 1);
        }
    }, [data?.hasNextPage]);

    const previousPage = useCallback(() => {
        if (data?.hasPreviousPage) {
            setPageNumber(prev => prev - 1);
        }
    }, [data?.hasPreviousPage]);

    const refresh = useCallback(() => {
        fetchData(pageNumber, pageSize);
    }, [fetchData, pageNumber, pageSize]);

    return {
        data,
        loading,
        error,
        pageNumber,
        pageSize,
        setPageSize,
        goToPage,
        nextPage,
        previousPage,
        refresh,
        fetchData,
    };
}
