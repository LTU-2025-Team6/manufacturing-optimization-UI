import { StepExecutionStatus } from '../enums/stepExecutionStatus';

/**
 * Summary of an execution plan for list views.
 */
export interface IExecutionPlanSummary {
  id: string;
  requestId: string;
  status: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  failedSteps: number;
  cancelledSteps: number;
  pendingSteps: number;
  
  progressPercentage: number;
}

/**
 * Detailed execution plan information.
 */
export interface IExecutionPlanDetail {
  id: string;
  requestId: string;
  status: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  
  steps: IExecutionStep[];
  
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  failedSteps: number;
  cancelledSteps: number;
  pendingSteps: number;
  
  progressPercentage: number;
}

/**
 * Execution step information.
 */
export interface IExecutionStep {
  id: string;
  stepNumber: number;
  processName: string;
  proposalId: string;
  providerId: string;
  providerName: string;
  status: StepExecutionStatus;
  
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedDuration?: string;
  
  estimatedCost?: number;
}

/**
 * Overall execution statistics.
 */
export interface IExecutionSummary {
  totalPlans: number;
  inProgressPlans: number;
  completedPlans: number;
  failedPlans: number;
  confirmedPlans: number;
  
  activePlans: IExecutionPlanSummary[];
  recentlyCompleted: IExecutionPlanSummary[];
  failed: IExecutionPlanSummary[];
}
