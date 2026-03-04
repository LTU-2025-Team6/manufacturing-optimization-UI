import { IOptimizationStrategy } from '../optimizationPlan/optimizationPlan';
import { IProviderSchedule } from '../provider/provider';

/**
 * POST /api/plans/{planId}/strategy/steps/{stepId}/validate-slot
 */
export interface IValidateSlotResponse {
  isValid: boolean;
  /** Full allocated schedule when valid */
  allocatedSchedule?: IProviderSchedule;
  errors?: string[];
}

/**
 * PUT /api/plans/{planId}/strategy
 * Backend re-calculates metrics and returns the full updated strategy.
 */
export interface IUpdateStrategyResponse {
  updatedStrategy: IOptimizationStrategy;
  validationErrors?: string[];
}

/**
 * POST /api/strategies/{strategyId}/select (confirm selection)
 */
export interface IConfirmStrategyResponse {
  success: boolean;
  errorMessage?: string;
}
