import { useApi } from './useApi';
import { IOptimizationRequest, IOptimizationPlan, IOptimizationPlanPreview, IConfirmStrategyResponse } from '../../types';

const API_URL = '/api/optimization-requests';

export function useRequestOptimizationPlan() {
    const { data, loading, error, callApi: callApiBase } = useApi<string>();

    const callApi = (req: IOptimizationRequest) => {
        return callApiBase({ url: API_URL, method: 'POST', body: req });
    };

    return { data, loading, error, callApi };
}

export function useConfirmStrategy() {
    const { data, loading, error, callApi: callApiBase } = useApi<IConfirmStrategyResponse>();

    const callApi = (strategyId: string) => {
        return callApiBase({ url: `/api/strategies/${strategyId}/confirm`, method: 'POST' });
    };

    return { data, loading, error, callApi };
}

export function useGetOptimizationPlan() {
    const { data, loading, error, callApi: callApiBase } = useApi<IOptimizationPlan>();

    const callApi = (requestId: string) => {
        return callApiBase({ url: `${API_URL}/${requestId}/plan` });
    };

    return { data, loading, error, callApi };
}

export function useGetOptimizationRequest() {
    const { data, loading, error, callApi: callApiBase } = useApi<IOptimizationRequest>();

    const callApi = (requestId: string) => {
        return callApiBase({ url: `${API_URL}/${requestId}` });
    };

    return { data, loading, error, callApi };
}

export function useCancelOptimizationPlan() {
    const { data, loading, error, callApi: callApiBase } = useApi<void>();

    const callApi = (planId: string) => {
        return callApiBase({ url: `/api/plans/${planId}/cancel`, method: 'POST' });
    };

    return { data, loading, error, callApi };
}

export function useDeleteOptimizationPlan() {
    const { data, loading, error, callApi: callApiBase } = useApi<void>();

    const callApi = (planId: string) => {
        return callApiBase({ url: `/api/plans/${planId}`, method: 'DELETE' });
    };

    return { data, loading, error, callApi };
}