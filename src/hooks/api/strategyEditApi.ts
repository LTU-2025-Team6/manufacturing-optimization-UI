import { useApi } from './useApi';
import {
    IGetAlternativesRequest,
    IAlternativeProvider,
    IValidateSlotRequest,
    IValidateSlotResponse,
    IUpdateStrategyRequest,
    IUpdateStrategyResponse,
} from '../../types';

const base = (planId: string) => `/api/plans/${planId}/strategy`;

/**
 * POST /api/plans/{planId}/strategy/steps/{stepId}/alternatives
 *
 * Backend contract:
 *   Body:     { scheduleWindowStart, scheduleWindowEnd }
 *   Response: IAlternativeProvider[]
 */
export function useGetAlternativeProviders() {
    const { data, loading, error, callApi: callApiBase } = useApi<IAlternativeProvider[]>();

    const callApi = (planId: string, stepId: string, request: IGetAlternativesRequest) =>
        callApiBase({
            url: `${base(planId)}/steps/${stepId}/alternatives`,
            method: 'POST',
            body: request,
        });

    return { data, loading, error, callApi };
}

/**
 * POST /api/plans/{planId}/strategy/steps/{stepId}/validate-slot
 *
 * Backend contract:
 *   Body:     { providerId, requestedStart, durationHours }
 *   Response: { isValid, allocatedSchedule?, errors? }
 */
export function useValidateSlot() {
    const { data, loading, error, callApi: callApiBase } = useApi<IValidateSlotResponse>();

    const callApi = (planId: string, stepId: string, request: IValidateSlotRequest) =>
        callApiBase({
            url: `${base(planId)}/steps/${stepId}/validate-slot`,
            method: 'POST',
            body: request,
        });

    return { data, loading, error, callApi };
}

/**
 * PUT /api/plans/{planId}/strategy
 *
 * Backend contract:
 *   Body:     { stepUpdates: [{ stepId, providerId?, scheduledStart, scheduledEnd }] }
 *   Response: { updatedStrategy, validationErrors? }
 */
export function useUpdateStrategy() {
    const { data, loading, error, callApi: callApiBase } = useApi<IUpdateStrategyResponse>();

    const callApi = (planId: string, request: IUpdateStrategyRequest) =>
        callApiBase({
            url: base(planId),
            method: 'PUT',
            body: request,
        });

    return { data, loading, error, callApi };
}
