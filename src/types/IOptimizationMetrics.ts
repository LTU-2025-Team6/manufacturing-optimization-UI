export interface IOptimizationMetrics {
    id: string;
    totalCost: number;
    totalDuration: string;
    averageQuality: number;
    totalEmissionsKgCO2: number;
    solverStatus: string;
    objectiveValue: number;
}
