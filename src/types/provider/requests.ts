export interface ICreateProviderRequest {
  type: string;
  name: string;
  autoStart: boolean;
  processCapabilities: ICreateProcessCapabilityRequest[];
  technicalCapabilities: ICreateTechnicalCapabilitiesRequest;
  workingHours: ICreateWorkingHoursRequest;
}

export interface ICreateProcessCapabilityRequest {
  process: string;
  costPerHour: number;
  speedMultiplier: number;
  qualityScore: number;
  energyConsumptionKwhPerHour: number;
  carbonIntensityKgCO2PerKwh: number;
  usesRenewableEnergy: boolean;
}

export interface ICreateTechnicalCapabilitiesRequest {
  axisHeight: number;
  power: number;
  tolerance: number;
}

export interface ICreateWorkingHoursRequest {
  workingDays: string[];
  workDayStartHour: number;
  workDayEndHour: number;
  is24x7: boolean;
  breaks: ICreateBreakPeriodRequest[];
}

export interface ICreateBreakPeriodRequest {
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  name: string;
}

export interface IUpdateProviderRequest {
  name?: string;
  autoStart?: boolean;
  processCapabilities?: IUpdateProcessCapabilityRequest[];
  technicalCapabilities?: IUpdateTechnicalCapabilitiesRequest;
  workingHours?: IUpdateWorkingHoursRequest;
}

export interface IUpdateProcessCapabilityRequest {
  process: string;
  costPerHour: number;
  speedMultiplier: number;
  qualityScore: number;
  energyConsumptionKwhPerHour: number;
  carbonIntensityKgCO2PerKwh: number;
  usesRenewableEnergy: boolean;
}

export interface IUpdateTechnicalCapabilitiesRequest {
  axisHeight: number;
  power: number;
  tolerance: number;
}

export interface IUpdateWorkingHoursRequest {
  workingDays: string[];
  workDayStartHour: number;
  workDayEndHour: number;
  is24x7: boolean;
  breaks: IUpdateBreakPeriodRequest[];
}

export interface IUpdateBreakPeriodRequest {
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  name: string;
}

export interface IToggleProviderRequest {
  isRunning: boolean;
}

export interface IProviderScheduleRequest {
  startDate: string;
  endDate: string;
}
