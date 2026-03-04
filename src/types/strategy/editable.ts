import { IOptimizationStrategy } from '../optimizationPlan/optimizationPlan';
import { IProviderSchedule } from '../provider/provider';

/**
 * Interface for editing a process step.
 * Allows changing provider and scheduling.
 */
export interface IEditableProcessStep {
  id: string;
  stepNumber: number;
  process: string;
  selectedProviderId: string;
  selectedProviderName: string;
  executionStatus: string;
  estimate: {
    id: string;
    cost: number;
    qualityScore: number;
    emissionsKgCO2: number;
    duration: number;
  };
  // Optional new schedule times (set when user picks a new slot)
  proposedStartTime?: string;
  allocatedSchedule?: {
    startWorkingTime: string;
    endWorkingTime: string;
    segments: Array<{
      startTime: string;
      endTime: string;
      segmentType: string;
      executionId?: string;
    }>;
  };
}

/**
 * Interface for the editable strategy.
 * Used when manually adjusting provider selections and scheduling.
 */
export interface IEditableStrategy extends Omit<IOptimizationStrategy, 'steps'> {
  steps: IEditableProcessStep[];
  isModified: boolean;
  originalStrategyId?: string;
}
