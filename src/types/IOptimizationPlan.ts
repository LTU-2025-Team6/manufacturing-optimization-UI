import { IOptimizationStrategy } from './IOptimizationStrategy';

export type OptimizationPlanStatus = 
    | 'Draft'
    | 'Submitted'
    | 'Processing'
    | 'AwaitingStrategySelection'
    | 'StrategySelected'
    | 'Ready'
    | 'Confirmed'
    | 'Failed';

export interface IOptimizationPlanPreview {
    id: string;
    requestId: string;
    status: OptimizationPlanStatus;
    createdAt: string;
}

export interface IOptimizationPlan {
    id: string;
    requestId: string;
    strategies: IOptimizationStrategy[];
    selectedStrategy?: IOptimizationStrategy;
    status: OptimizationPlanStatus;
    createdAt: string;
    selectedAt?: string;
    confirmedAt?: string;
    errorMessage?: string;
}

export interface IConfirmStrategyResponse {
    confirmedPlan: IOptimizationPlan;
    confirmationErrors?: string[] | null;
}