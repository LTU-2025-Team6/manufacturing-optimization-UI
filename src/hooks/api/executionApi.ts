import { useApi } from './useApi';
import { usePollingApi } from './usePollingApi';
import { IExecutionPlanSummary, IExecutionPlanDetail, IExecutionStep, IExecutionSummary } from '../../types/IExecution';

/**
 * Get summary of all execution plans
 */
export function useGetAllPlans() {
    const { data, loading, error, callApi: callApiBase } = useApi<IExecutionPlanSummary[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/execution/plans' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get all execution plans with polling
 * @param interval - polling interval in milliseconds (default: 3000)
 */
export function useAllPlansPolling(interval: number = 3000) {
    return usePollingApi<IExecutionPlanSummary[]>(
        { url: '/api/execution/plans' },
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
 * Get plans currently in progress
 */
export function useGetInProgressPlans() {
    const { data, loading, error, callApi: callApiBase } = useApi<IExecutionPlanSummary[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/execution/plans/in-progress' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get in-progress plans with polling
 * @param interval - polling interval in milliseconds (default: 3000)
 */
export function useInProgressPlansPolling(interval: number = 3000) {
    return usePollingApi<IExecutionPlanSummary[]>(
        { url: '/api/execution/plans/in-progress' },
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
