import { useApi } from './useApi';
import { IProvider } from '../../types/IProvider';

export function useGetProviders() {
    const { data, loading, error, callApi: callApiBase } = useApi<IProvider[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/providers' });
    };

    return { data, loading, error, callApi };
}
