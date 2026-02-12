import { IOptimizationStrategy } from './IOptimizationStrategy';
import { IProcessStep } from './IProcessStep';
import { IProviderSchedule } from './IProviderSchedule';

/**
 * Interface for editing a process step
 * Allows changing provider and scheduling
 */
export interface IEditableProcessStep extends Omit<IProcessStep, 'selectedProviderId' | 'selectedProviderName' | 'allocatedSchedule'> {
    selectedProviderId: string;
    selectedProviderName: string;
    // Optional new schedule times
    proposedStartTime?: string;
    proposedEndTime?: string;
    allocatedSchedule?: {
        startWorkingTime: string;
        endWorkingTime: string;
        segments: Array<{
            startTime: string;
            endTime: string;
            segmentType: string;
        }>;
    };
}

/**
 * Interface for the editable strategy
 * Used when manually adjusting provider selections and scheduling
 */
export interface IEditableStrategy extends Omit<IOptimizationStrategy, 'steps'> {
    steps: IEditableProcessStep[];
    isModified: boolean;
    originalStrategyId?: string;
}

/**
 * Request to update a strategy with manual changes
 */
export interface IUpdateStrategyRequest {
    strategyId: string;
    updates: {
        stepId: string;
        newProviderId?: string;
        newStartTime?: string;
        newEndTime?: string;
    }[];
}

/**
 * Response from updating a strategy
 * Contains re-calculated metrics and updated schedule
 */
export interface IUpdateStrategyResponse {
    updatedStrategy: IOptimizationStrategy;
    validationErrors?: string[];
}

/**
 * Alternative provider option for a process step
 */
export interface IAlternativeProvider {
    providerId: string;
    providerName: string;
    estimate: {
        cost: number;
        qualityScore: number;
        emissionsKgCO2: number;
        duration: number;
    };
    schedule: IProviderSchedule;
}

/**
 * Request to get alternative providers for a step
 */
export interface IGetAlternativeProvidersRequest {
    scheduleStartTime: string;
    scheduleEndTime: string;
    requestedStartTime?: string;
}

/**
 * Request to validate process start time on provider schedule
 */
export interface IValidateProcessTimeRequest {
    providerId: string;
    processType: string;
    requestedStartTime: string;
    estimatedDuration: number;
}

/**
 * Response from validating process start time
 */
export interface IValidateProcessTimeResponse {
    isValid: boolean;
    validatedSchedule?: IProviderSchedule;
    errors?: string[];
}