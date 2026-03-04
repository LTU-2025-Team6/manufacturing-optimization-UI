import { useState, useCallback, useRef } from 'react';
import { parseApiError } from './apiError';
import { IProblemDetails } from '../../types';

const BASE_URL = 'http://localhost:5000';

export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: IProblemDetails | null;
}

export interface ApiRequest {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
}

/**
 * Build full URL from relative path
 */
function buildUrl(url: string): string {
    return url.startsWith('http') ? url : BASE_URL + url;
}

/**
 * Parse response based on content-type
 */
async function parseResponse(res: Response): Promise<any> {
    const contentType = res.headers.get('content-type');

    if (contentType?.includes('application/json')) {
        return await res.json();
    }

    return await res.text();
}

/**
 * Execute HTTP request with error handling
 */
async function executeRequest(req: ApiRequest): Promise<any> {
    const { url, method = 'GET', body, headers = {} } = req;

    const response = await fetch(buildUrl(url), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        throw data;
    }

    return data;
}

/**
 * Universal API hook for making HTTP requests.
 * @template TRes - response data type
 */
export function useApi<TRes = any>() {
    const [state, setState] = useState<ApiState<TRes>>({
        data: null,
        loading: false,
        error: null,
    });
    
    const prevDataRef = useRef<string | null>(null);
    const isFirstRequestRef = useRef(true);

    const callApi = useCallback(async (req: ApiRequest, skipLoadingState = false): Promise<TRes> => {
        // Only show loading for first request or when explicitly requested
        if (!skipLoadingState) {
            setState(prev => ({ ...prev, loading: true, error: null }));
        }

        try {
            const data = await executeRequest(req);
            
            // Only update state if data actually changed
            const dataString = JSON.stringify(data);
            if (prevDataRef.current !== dataString) {
                prevDataRef.current = dataString;
                setState({ data, loading: false, error: null });
                isFirstRequestRef.current = false;
            } else if (!skipLoadingState) {
                // Data unchanged, just update loading state if it was set
                setState(prev => ({ ...prev, loading: false }));
            }
            // If skipLoadingState=true and data unchanged, don't update state at all
            
            return data;
        } catch (error: any) {
            const problem = parseApiError(error);
            setState({ data: null, loading: false, error: problem });
            isFirstRequestRef.current = false;
            throw problem;
        }
    }, []);

    return { ...state, callApi, isFirstRequest: isFirstRequestRef.current };
}
