/**
 * POST /api/plans/{planId}/strategy/steps/{stepId}/alternatives
 */
export interface IGetAlternativesRequest {
  scheduleWindowStart: string;
  scheduleWindowEnd: string;
}

/**
 * POST /api/plans/{planId}/strategy/steps/{stepId}/validate-slot
 */
export interface IValidateSlotRequest {
  providerId: string;
  requestedStart: string;
  /** Duration of the process in hours */
  durationHours: number;
}

/**
 * One step change inside IUpdateStrategyRequest.
 */
export interface IStepUpdate {
  stepId: string;
  /** Omit if provider has not changed */
  providerId?: string;
  scheduledStart: string;
  scheduledEnd: string;
}

/**
 * PUT /api/plans/{planId}/strategy
 */
export interface IUpdateStrategyRequest {
  stepUpdates: IStepUpdate[];
}
