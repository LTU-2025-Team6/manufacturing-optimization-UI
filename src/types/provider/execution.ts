import { ProcessType, ProposalStatus } from '../enums/processType';
import { IMotorSpecifications } from '../optimizationRequest/optimizationRequest';
import { IProcessEstimate } from './provider';

/**
 * Execution details from provider.
 */
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
  scheduleSegments: IExecutionScheduleSegment[];
}

export interface IExecutionScheduleSegment {
  id: string;
  startTime: string;
  endTime: string;
}