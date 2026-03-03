import { useApi } from './useApi';
import { usePollingApi } from './usePollingApi';
import { ISimulationTime, ISetSimulationTimeRequest } from '../../types/ISimulationTime';

/**
 * Get current simulation time (one-time)
 */
export function useGetSimulationTime() {
    const { data, loading, error, callApi: callApiBase } = useApi<ISimulationTime>();

    const callApi = () => {
        return callApiBase({ url: '/api/system' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get current simulation time with polling
 * @param interval - polling interval in milliseconds (default: 2000)
 */
export function useSimulationTimePolling(interval: number = 2000) {
    return usePollingApi<ISimulationTime>(
        { url: '/api/system' },
        { 
            interval,
            immediate: true,
            timeout: Infinity // Never timeout for simulation time
        }
    );
}

/**
 * Set simulation time and/or speed for all services
 */
export function useSetSimulationTime() {
    const { data, loading, error, callApi: callApiBase } = useApi<ISimulationTime>();

    const callApi = (request: ISetSimulationTimeRequest) => {
        return callApiBase({ 
            url: '/api/system',
            method: 'PUT',
            body: request
        });
    };

    return { data, loading, error, callApi };
}
