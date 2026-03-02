import { IMotorSpecifications } from './IMotorSpecifications';
import { IProcessEstimate } from './IProcessEstimate';
import { ProcessType } from './ProcessType';

export interface IExecutionDetails {
    executionId: string;
    proposalId: string;
    planId: string;
    providerId: string;
    process: ProcessType;
    status: ProposalStatus;
    arrivedAt: string;
    modifiedAt?: string;
    motorSpecs: IMotorSpecifications;
    estimate?: IProcessEstimate;
    scheduleSegments: IExecutionTimeSlot[];
}

export interface IExecutionTimeSlot {
    id: string;
    startTime: string;
    endTime: string;
}

export enum ProposalStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Failed = 'Failed'
}
