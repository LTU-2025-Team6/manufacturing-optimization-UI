import { IProcessEstimate, IProviderSchedule } from '../provider/provider';

export type OptimizationPlanStatus = 
    | 'Draft'
    | 'MatchingWorkflow'
    | 'MatchingProviders'
    | 'EstimatingCosts'
    | 'GeneratingStrategies'
    | 'AwaitingStrategySelection'
    | 'StrategySelected'
    | 'Ready'
    | 'Confirmed'
    | 'InProgress'
    | 'Completed'
    | 'Failed';

/**
 * Preview information about an optimization plan for list views.
 */
export interface IOptimizationPlanPreview {
  id: string;
  requestId: string;
  status: OptimizationPlanStatus;
  createdAt: string;
}

/**
 * Complete optimization plan with all strategies.
 */
export interface IOptimizationPlan {
  id: string;
  requestId: string;
  strategies: IOptimizationStrategy[];
  selectedStrategy?: IOptimizationStrategy;
  status: OptimizationPlanStatus;
  createdAt: string;
  selectedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

/**
 * Optimization strategy with process steps and metrics.
 */
export interface IOptimizationStrategy {
  id: string;
  planId?: string;
  strategyName: string;
  priority: string;
  workflowType: string;
  steps: IProcessStep[];
  metrics: IOptimizationMetrics;
  warranty: IWarrantyTerms;
  description: string;
}

/**
 * Process step within a strategy.
 */
export interface IProcessStep {
  id: string;
  stepNumber: number;
  process: string;
  selectedProviderId: string;
  selectedProviderName: string;
  executionStatus: string;
  estimate: IProcessEstimate;
  allocatedSchedule?: IProviderSchedule;
}

/**
 * Optimization metrics for a strategy.
 */
export interface IOptimizationMetrics {
  id: string;
  totalCost: number;
  totalDuration: string; // TimeSpan as string
  averageQuality: number;
  totalEmissionsKgCO2: number;
  solverStatus: string;
  objectiveValue: number;
}

/**
 * Warranty terms for a strategy.
 */
export interface IWarrantyTerms {
  id: string;
  level: string;
  durationMonths: number;
  description: string;
  includesInsurance: boolean;
}
