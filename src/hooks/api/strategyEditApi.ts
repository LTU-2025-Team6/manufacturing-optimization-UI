import { useApi } from './useApi';
import { 
    IUpdateStrategyRequest, 
    IUpdateStrategyResponse, 
    IAlternativeProvider,
    IGetAlternativeProvidersRequest,
    IValidateProcessTimeRequest,
    IValidateProcessTimeResponse
} from '../../types/IEditableStrategy';

/**
 * Hook to get alternative providers for a process step
 * Endpoint: POST /api/strategies/{strategyId}/steps/{stepId}/alternative-providers
 */
export function useGetAlternativeProviders() {
    const { data, loading, error, callApi: callApiBase } = useApi<IAlternativeProvider[]>();

    const callApi = (
        strategyId: string,
        stepId: string,
        request: IGetAlternativeProvidersRequest
    ) => {
        return callApiBase({ 
            url: `/api/strategies/${strategyId}/steps/${stepId}/alternative-providers`,
            method: 'POST',
            body: request
        });
    };

    return { data, loading, error, callApi };
}

/**
 * Hook to validate process start time on provider schedule
 * Endpoint: POST /api/strategies/{strategyId}/steps/{stepId}/validate-time
 */
export function useValidateProcessTime() {
    const { data, loading, error, callApi: callApiBase } = useApi<IValidateProcessTimeResponse>();

    const callApi = (
        strategyId: string,
        stepId: string,
        request: IValidateProcessTimeRequest
    ) => {
        console.log('Validating process time with request:', request);
        return callApiBase({ 
            url: `/api/strategies/${strategyId}/steps/${stepId}/validate-time`,
            method: 'POST',
            body: request
        });
    };

    return { data, loading, error, callApi };
}

/**
 * Hook to update strategy with manual changes
 * Endpoint: PUT /api/strategies/{strategyId}
 */
export function useUpdateStrategy() {
    const { data, loading, error, callApi: callApiBase } = useApi<IUpdateStrategyResponse>();

    const callApi = (
        strategyId: string,
        request: IUpdateStrategyRequest
    ) => {
        return callApiBase({ 
            url: `/api/strategies/${strategyId}`,
            method: 'PUT',
            body: request
        });
    };

    return { data, loading, error, callApi };
}

