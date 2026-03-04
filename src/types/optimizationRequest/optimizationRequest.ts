/**
 * Optimization request DTO.
 */
export interface IOptimizationRequest {
  customerId: string;
  motorSpecs: IMotorSpecifications;
  constraints: IOptimizationRequestConstraints;
  createdAt: string;
}

/**
 * Motor specifications.
 */
export interface IMotorSpecifications {
  powerKW: number;
  axisHeightMM: number;
  currentEfficiency: string;
  targetEfficiency: string;
  malfunctionDescription?: string;
}

/**
 * Optimization constraints.
 */
export interface IOptimizationRequestConstraints {
  maxBudget?: number;
  timeWindow: ITimeWindow;
}

/**
 * Time window constraint.
 */
export interface ITimeWindow {
  startTime: string;
  endTime: string;
}
