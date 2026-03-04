import { IOptimizationPlan } from './optimizationPlan';

/**
 * Response when cancelling a plan.
 */
export interface ICancelPlanResponse {
  plan: IOptimizationPlan;
  errors: string[];
  isSuccess: boolean;
}
