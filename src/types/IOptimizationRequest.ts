import { IMotorSpecifications } from './IMotorSpecifications';
import { IOptimizationRequestConstraints } from './IOptimizationRequestConstraints';

export interface IOptimizationRequest {
    customerId: string;
    motorSpecs: IMotorSpecifications;
    constraints: IOptimizationRequestConstraints;
    createdAt: string;
}
