export type StepExecutionStatus = 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';

/**
 * Summary DTO for execution plan (list view)
 */
export interface IExecutionPlanSummary {
    id: string;
    requestId: string;
    status: string;
    createdAt: string;
    confirmedAt: string | null;
    completedAt: string | null;
    errorMessage: string | null;
    totalSteps: number;
    completedSteps: number;
    inProgressSteps: number;
    failedSteps: number;
    cancelledSteps: number;
    pendingSteps: number;
    progressPercentage: number;
}

/**
 * Detailed execution plan DTO
 */
export interface IExecutionPlanDetail {
    id: string;
    requestId: string;
    status: string;
    createdAt: string;
    confirmedAt: string | null;
    completedAt: string | null;
    errorMessage: string | null;
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
 * Execution step DTO
 */
export interface IExecutionStep {
    id: string;
    stepNumber: number;
    processName: string;
    proposalId: string;
    providerId: string;
    providerName: string;
    status: StepExecutionStatus;
    scheduledStart: string | null;
    scheduledEnd: string | null;
    estimatedDuration: string | null;
    estimatedCost: number | null;
}

/**
 * Overall execution statistics and summary
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
