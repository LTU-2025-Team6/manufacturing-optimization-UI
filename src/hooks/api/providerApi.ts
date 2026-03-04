import { useApi } from './useApi';
import { 
  IProvider, 
  IProviderPreview, 
  IUpdateProviderRequest, 
  ICreateProviderRequest,
  IProviderScheduleRequest,
  IProviderDaySchedule,
  IExecutionDetails,
  PagedResult,
  DEFAULT_PAGE_SIZE
} from '../../types';

export function useGetProviders() {
    const { data, loading, error, callApi: callApiBase } = useApi<PagedResult<IProviderPreview>>();

    const callApi = (pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
        return callApiBase({ url: `/api/providers?pageNumber=${pageNumber}&pageSize=${pageSize}` });
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
    const { data, loading, error, callApi: callApiBase } = useApi<IProviderDaySchedule[]>();

    const callApi = (id: string, request: IProviderScheduleRequest) => {
        return callApiBase({ 
            url: `/api/providers/${id}/schedule?startDate=${request.startDate}&endDate=${request.endDate}`, 
            method: 'GET'
        });
    };

    return { data, loading, error, callApi };
}

export function useCreateProvider() {
    const { data, loading, error, callApi: callApiBase } = useApi<IProvider>();

    const callApi = (request: ICreateProviderRequest) => {
        return callApiBase({ 
            url: '/api/providers', 
            method: 'POST',
            body: request
        });
    };

    return { data, loading, error, callApi };
}

export function useDeleteProvider() {
    const { data, loading, error, callApi: callApiBase } = useApi<void>();

    const callApi = (id: string) => {
        return callApiBase({ 
            url: `/api/providers/${id}`, 
            method: 'DELETE'
        });
    };

    return { data, loading, error, callApi };
}

export function useGetExecutionDetails() {
    const { data, loading, error, callApi: callApiBase } = useApi<IExecutionDetails>();

    const callApi = (providerId: string, executionId: string) => {
        return callApiBase({ 
            url: `/api/providers/${providerId}/executions/${executionId}`, 
            method: 'GET'
        });
    };

    return { data, loading, error, callApi };
}
