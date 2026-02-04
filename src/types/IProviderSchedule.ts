export interface IProviderSchedule {
    startTime: string;
    endTime: string;
    segments: IProviderScheduleSegment[];
}

export interface IProviderDayScheduleDto
{
    date: string;
    segments: IProviderScheduleSegment[];
}

export interface IProviderScheduleSegment {
    startTime: string;
    endTime: string;
    segmentType: string;
}