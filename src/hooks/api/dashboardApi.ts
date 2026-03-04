import { useApi } from './useApi';
import { IDashboardStats } from '../../types';

const API_URL = '/api/dashboard';

/**
 * Hook для получения статистики дашборда
 * Простой минималистичный endpoint
 */
export function useGetDashboardStats() {
    const { data, loading, error, callApi: callApiBase } = useApi<IDashboardStats>();

    const callApi = () => {
        return callApiBase({ url: `${API_URL}/stats` });
    };

    return { data, loading, error, callApi };
}
