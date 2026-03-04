import { useApi } from './useApi';
import { IOptimizationPlan, IOptimizationPlanPreview, PagedResult, DEFAULT_PAGE_SIZE } from '../../types';

const API_URL = '/api/plans';

export function useGetOptimizationPlans() {
    const { data, loading, error, callApi: callApiBase } = useApi<PagedResult<IOptimizationPlanPreview>>();

    const callApi = (pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
        return callApiBase({ url: `${API_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}` });
    };

    return { data, loading, error, callApi };
}

export function useGetOptimizationPlan() {
    const { data, loading, error, callApi: callApiBase } = useApi<IOptimizationPlan>();

    const callApi = (planId: string) => {
        return callApiBase({ url: `${API_URL}/${planId}` });
    };

    return { data, loading, error, callApi };
}

export function useSelectStrategy() {
    const { data, loading, error, callApi: callApiBase } = useApi<void>();

    const callApi = (planId: string, strategyId: string) => {
        return callApiBase({ url: `${API_URL}/${planId}/select-strategy`, method: 'PUT', body: strategyId });
    };

    return { data, loading, error, callApi };
}