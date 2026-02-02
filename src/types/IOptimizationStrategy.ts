import { IProcessStep } from './IProcessStep';
import { IOptimizationMetrics } from './IOptimizationMetrics';
import { IWarrantyTerms } from './IWarrantyTerms';

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
