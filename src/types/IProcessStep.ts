import { IProcessEstimate } from './IProcessEstimate';
import { IProviderSchedule } from './IProviderSchedule';

export type StepExecutionStatus = 'Pending' | 'InProgress' | 'Completed' | 'Failed';

export interface IProcessStep {
    id: string;
    stepNumber: number;
    process: string;
    selectedProviderId: string;
    selectedProviderName: string;
    executionStatus?: StepExecutionStatus;
    estimate: IProcessEstimate;
    allocatedSchedule?: IProviderSchedule;
}
