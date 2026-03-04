/**
 * Preview information about a provider for list views.
 */
export interface IProviderPreview {
  id: string;
  type: string;
  name: string;
  isRunning: boolean;
}

/**
 * Complete provider information including capabilities and working hours.
 */
export interface IProvider {
  id: string;
  type: string;
  name: string;
  autoStart: boolean;
  isRunning: boolean;
  processCapabilities: IProcessCapability[];
  technicalCapabilities: ITechnicalCapabilities;
  workingHours: IProviderWorkingHours;
}

/**
 * Alternative provider option with estimate and schedule.
 */
export interface IAlternativeProvider {
  providerId: string;
  providerName: string;
  estimate: IProcessEstimate;
  schedule: IProviderSchedule;
}

export interface ITechnicalCapabilities {
  axisHeight: number;
  power: number;
  tolerance: number;
}

export interface IProcessCapability {
  process: string;
  costPerHour: number;
  speedMultiplier: number;
  qualityScore: number;
  energyConsumptionKwhPerHour: number;
  carbonIntensityKgCO2PerKwh: number;
  usesRenewableEnergy: boolean;
}

export interface IProviderWorkingHours {
  workingDays: string[];
  workDayStartHour: number;
  workDayEndHour: number;
  is24x7: boolean;
  breaks: IProviderBreakPeriod[];
}

export interface IProviderBreakPeriod {
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  name: string;
}

/**
 * Process estimate for a step.
 */
export interface IProcessEstimate {
  id: string;
  cost: number;
  qualityScore: number;
  emissionsKgCO2: number;
  duration: number;
}

/**
 * Provider schedule information.
 */
export interface IProviderSchedule {
  startWorkingTime: string;
  endWorkingTime: string;
  segments: IProviderScheduleSegment[];
}

export interface IProviderDaySchedule {
  date: string;
  segments: IProviderScheduleSegment[];
}

export interface IProviderScheduleSegment {
  startTime: string;
  endTime: string;
  segmentType: string;
  executionId?: string;
}
