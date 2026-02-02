import { IProviderScheduleSegment } from './IProviderScheduleSegment';

export interface IProviderSchedule {
    startTime: string;
    endTime: string;
    segments: IProviderScheduleSegment[];
}
    