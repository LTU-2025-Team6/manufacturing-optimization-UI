import { ITimeWindow } from './ITimeWindow';

export interface IOptimizationRequestConstraints {
    maxBudget?: number;
    timeWindow: ITimeWindow;
}
