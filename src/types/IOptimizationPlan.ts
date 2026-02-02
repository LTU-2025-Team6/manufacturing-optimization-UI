import { IOptimizationStrategy } from './IOptimizationStrategy';

export interface IOptimizationPlan {
    id: string;
    requestId: string;
    strategies: IOptimizationStrategy[];
    selectedStrategy?: IOptimizationStrategy;
    status: string;
    createdAt: string;
    selectedAt?: string;
    confirmedAt?: string;
    errorMessage?: string;
}
