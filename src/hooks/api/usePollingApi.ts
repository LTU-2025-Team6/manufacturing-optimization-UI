import { useEffect, useRef, useState, useCallback } from 'react';
import { useApi, ApiRequest, ApiState } from './useApi';

export interface UsePollingApiOptions {
    // Interval between requests in milliseconds (default 2000) 
    interval?: number;
    // Maximum polling time in milliseconds (default 30000)
    timeout?: number;
    // Start polling immediately on mount (default true)
    immediate?: boolean;
    // Optional callback to determine if polling should stop based on response data
    stopCondition?: (data: any) => boolean;
}

export interface PollingApiState<T> extends ApiState<T> {
    elapsed: number;
    isTimeout: boolean;
    stop: () => void;
    restart: () => void;
}

/**
 * Hook for periodic API requests (polling) with timeout and elapsed time tracking
 * @template TRes - response data type
 * @param request - API request parameters
 * @param options - polling options
 */
export function usePollingApi<TRes = any>(
    request: ApiRequest,
    options?: UsePollingApiOptions
): PollingApiState<TRes> {
    const { interval = 2000, timeout = 30000, immediate = true, stopCondition } = options || {};
    
    const [elapsed, setElapsed] = useState(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const stoppedRef = useRef(false);
    const requestRef = useRef(request);
    const intervalRef = useRef(interval);
    const timeoutRef = useRef(timeout);
    const stopConditionRef = useRef(stopCondition);

    // Update refs when values change
    useEffect(() => {
        requestRef.current = request;
        intervalRef.current = interval;
        timeoutRef.current = timeout;
        stopConditionRef.current = stopCondition;
    }, [request, interval, timeout, stopCondition]);

    const { data, loading, error, callApi } = useApi<TRes>();

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const stop = useCallback(() => {
        stoppedRef.current = true;
        clearTimer();
    }, [clearTimer]);

    const poll = useCallback(async () => {
        if (stoppedRef.current) return;

        // Initialize start time
        if (startTimeRef.current === null) {
            startTimeRef.current = Date.now();
        }

        // Execute request (errors are handled in useApi)
        let responseData: TRes | undefined;
        try {
            console.log('Polling API request:', requestRef.current);
            responseData = await callApi(requestRef.current);
            console.log('Polling response data:', responseData);
        } catch {
            // Error already handled in useApi and stored in error
            // Stop polling on error
            stop();
            return;
        }

        // Check if we should stop based on response data
        if (stopConditionRef.current && responseData && stopConditionRef.current(responseData)) {
            stop();
            return;
        }

        // Update elapsed time
        const now = Date.now();
        const elapsedMs = now - (startTimeRef.current || now);
        setElapsed(elapsedMs);

        // Check timeout
        if (elapsedMs >= timeoutRef.current) {
            setIsTimeout(true);
            stop();
            return;
        }

        // Schedule next request
        timerRef.current = setTimeout(poll, intervalRef.current);
    }, [callApi, stop]);

    const restart = useCallback(() => {
        stoppedRef.current = false;
        startTimeRef.current = null;
        setElapsed(0);
        setIsTimeout(false);
        clearTimer();
        poll();
    }, [poll, clearTimer]);

    useEffect(() => {
        if (!immediate) {
            // Stop polling if immediate becomes false
            stop();
            return;
        }

        // Reset state and start polling
        startTimeRef.current = null;
        stoppedRef.current = false;
        setElapsed(0);
        setIsTimeout(false);
        
        poll();

        return () => {
            stop();
        };
    }, [immediate, poll, stop]);

    return {
        data,
        loading,
        error,
        elapsed,
        isTimeout,
        stop,
        restart,
    };
}
