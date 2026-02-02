import { IProcessEstimate } from './IProcessEstimate';
import { IProviderSchedule } from './IProviderSchedule';

export interface IProcessStep {
    id: string;
    stepNumber: number;
    process: string;
    selectedProviderId: string;
    selectedProviderName: string;
    estimate: IProcessEstimate;
    allocatedSchedule?: IProviderSchedule;
}
