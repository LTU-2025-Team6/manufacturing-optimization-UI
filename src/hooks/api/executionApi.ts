import { useApi } from './useApi';
import { usePollingApi } from './usePollingApi';
import { IExecutionPlanSummary, IExecutionPlanDetail, IExecutionStep, IExecutionSummary, PagedResult, DEFAULT_PAGE_SIZE } from '../../types';

/**
 * Get summary of all execution plans - paginated
 */
export function useGetAllPlans() {
    const { data, loading, error, callApi: callApiBase } = useApi<PagedResult<IExecutionPlanSummary>>();

    const callApi = (pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
        return callApiBase({ url: `/api/execution/plans?pageNumber=${pageNumber}&pageSize=${pageSize}` });
    };

    return { data, loading, error, callApi };
}

/**
 * Get all execution plans with polling - paginated
 * @param interval - polling interval in milliseconds (default: 3000)
 */
export function useAllPlansPolling(pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE, interval: number = 3000) {
    return usePollingApi<PagedResult<IExecutionPlanSummary>>(
        { url: `/api/execution/plans?pageNumber=${pageNumber}&pageSize=${pageSize}` },
        { 
            interval,
            immediate: true,
            timeout: Infinity
        }
    );
}

/**
 * Get detailed information about a specific execution plan
 */
export function useGetPlanDetail() {
    const { data, loading, error, callApi: callApiBase } = useApi<IExecutionPlanDetail>();

    const callApi = (planId: string) => {
        return callApiBase({ url: `/api/execution/plans/${planId}` });
    };

    return { data, loading, error, callApi };
}

/**
 * Get plan detail with polling
 * @param planId - the plan ID to monitor
 * @param interval - polling interval in milliseconds (default: 2000)
 */
export function usePlanDetailPolling(planId: string, interval: number = 2000) {
    return usePollingApi<IExecutionPlanDetail>(
        { url: `/api/execution/plans/${planId}` },
        { 
            interval,
            immediate: true,
            timeout: Infinity
        }
    );
}

/**
 * Get plans currently in progress - paginated
 */
export function useGetInProgressPlans() {
    const { data, loading, error, callApi: callApiBase } = useApi<PagedResult<IExecutionPlanSummary>>();

    const callApi = (pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
        return callApiBase({ url: `/api/execution/plans/in-progress?pageNumber=${pageNumber}&pageSize=${pageSize}` });
    };

    return { data, loading, error, callApi };
}

/**
 * Get in-progress plans with polling - Now paginated
 * @param interval - polling interval in milliseconds (default: 3000)
 */
export function useInProgressPlansPolling(pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE, interval: number = 3000) {
    return usePollingApi<PagedResult<IExecutionPlanSummary>>(
        { url: `/api/execution/plans/in-progress?pageNumber=${pageNumber}&pageSize=${pageSize}` },
        { 
            interval,
            immediate: true,
            timeout: Infinity
        }
    );
}

/**
 * Get execution steps for a specific plan
 */
export function useGetPlanSteps() {
    const { data, loading, error, callApi: callApiBase } = useApi<IExecutionStep[]>();

    const callApi = (planId: string) => {
        return callApiBase({ url: `/api/execution/plans/${planId}/steps` });
    };

    return { data, loading, error, callApi };
}

/**
 * Get overall execution statistics and summary
 */
export function useGetExecutionSummary() {
    const { data, loading, error, callApi: callApiBase } = useApi<IExecutionSummary>();

    const callApi = () => {
        return callApiBase({ url: '/api/execution/summary' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get execution summary with polling
 * @param interval - polling interval in milliseconds (default: 5000)
 */
export function useExecutionSummaryPolling(interval: number = 5000) {
    return usePollingApi<IExecutionSummary>(
        { url: '/api/execution/summary' },
        { 
            interval,
            immediate: true,
            timeout: Infinity
        }
    );
}
