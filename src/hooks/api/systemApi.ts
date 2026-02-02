import { useApi } from './useApi';

export interface SystemReadyResponse {
    ready: boolean;
}

export function useSystemReady() {
    const { data, loading, error, callApi: callApiBase } = useApi<SystemReadyResponse>();

    const callApi = () => {
        return callApiBase({ url: '/api/system/ready' });
    };

    return { data, loading, error, callApi };
}
