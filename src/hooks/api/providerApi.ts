import { useApi } from './useApi';
import { IProvider, IProviderPreview, IUpdateProviderRequest } from '../../types/IProvider';
import { IProviderScheduleRequest } from '../../types/IProviderScheduleRequest';
import { IProviderDayScheduleDto } from '../../types/IProviderSchedule';

export function useGetProviders() {
    const { data, loading, error, callApi: callApiBase } = useApi<IProviderPreview[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/providers' });
    };

    return { data, loading, error, callApi };
}

export function useGetProvider() {
    const { data, loading, error, callApi: callApiBase } = useApi<IProvider>();

    const callApi = (id: string) => {
        return callApiBase({ url: `/api/providers/${id}` });
    };

    return { data, loading, error, callApi };
}

export function useUpdateProvider() {
    const { data, loading, error, callApi: callApiBase } = useApi<IProvider>();

    const callApi = (id: string, request: IUpdateProviderRequest) => {
        return callApiBase({ 
            url: `/api/providers/${id}`, 
            method: 'PUT',
            body: request
        });
    };

    return { data, loading, error, callApi };
}

export function useToggleProvider() {
    const { data, loading, error, callApi: callApiBase } = useApi<IProvider>();

    const callApi = (id: string, isRunning: boolean) => {
        return callApiBase({ 
            url: `/api/providers/${id}`, 
            method: 'PATCH',
            body: { isRunning }
        });
    };

    return { data, loading, error, callApi };
}

export function useGetProviderSchedule() {
    const { data, loading, error, callApi: callApiBase } = useApi<IProviderDayScheduleDto[]>();

    const callApi = (id: string, request: IProviderScheduleRequest) => {
        return callApiBase({ 
            url: `/api/providers/${id}/schedule?start=${request.startDate}&end=${request.endDate}`, 
            method: 'GET'
        });
    };

    return { data, loading, error, callApi };
}
