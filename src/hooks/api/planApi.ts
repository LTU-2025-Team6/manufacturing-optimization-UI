import { useApi } from './useApi';
import { IOptimizationPlan, IOptimizationPlanPreview } from '../../types/IOptimizationPlan';

const API_URL = '/api/plans';

export function useGetOptimizationPlans() {
    const { data, loading, error, callApi: callApiBase } = useApi<IOptimizationPlanPreview[]>();

    const callApi = () => {
        return callApiBase({ url: `${API_URL}` });
    };

    return { data, loading, error, callApi };
}

export function useGetOptimizationPlan() {
    const { data, loading, error, callApi: callApiBase } = useApi<IOptimizationPlan>();

    const callApi = ([planId]: string) => {
        return callApiBase({ url: `${API_URL}/${planId}` });
    };

    return { data, loading, error, callApi };
}