import { useApi } from './useApi';
import { IOptimizationRequest } from '../../types/IOptimizationRequest';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';

const API_URL = '/api/optimization-requests';

export function useRequestOptimizationPlan() {
    const { data, loading, error, callApi: callApiBase } = useApi<string>();

    const callApi = (req: IOptimizationRequest) => {
        return callApiBase({ url: API_URL, method: 'POST', body: req });
    };

    return { data, loading, error, callApi };
}

export function useSelectStrategy() {
    const { data, loading, error, callApi: callApiBase } = useApi<void>();

    const callApi = (requestId: string, strategyId: string) => {
        return callApiBase({ url: `${API_URL}/${requestId}/strategy`, method: 'PUT', body: strategyId });
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
