import { IProcessCapability } from './IProcessCapability';
import { ITechnicalCapabilities } from './ITechnicalCapabilities';

export interface IProviderPreview {
    id: string;
    type: string;
    name: string;
    isRunning: boolean;
}

export interface IProvider {
    id: string;
    type: string;
    name: string;
    isRunning: boolean;
    autoStart: boolean;
    processCapabilities: IProcessCapability[];
    technicalCapabilities: ITechnicalCapabilities;
    workingHours: IProviderWorkingHours;
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

export interface IUpdateProviderRequest {
    name: string;
    autoStart: boolean;
    processCapabilities: IUpdateProcessCapabilitiesRequest[];
    technicalCapabilities: IUpdateProviderTechnicalCapabilitiesRequest;
    workingHours: IUpdateProviderWorkingHoursRequest;
}

export interface IUpdateProcessCapabilitiesRequest {
    process: string;
    costPerHour: number;
    speedMultiplier: number;
    qualityScore: number;
    energyConsumptionKwhPerHour: number;
    carbonIntensityKgCO2PerKwh: number;
    usesRenewableEnergy: boolean;
}

export interface IUpdateProviderTechnicalCapabilitiesRequest {
    axisHeight: number;
    power: number;
    tolerance: number;
}

export interface IUpdateProviderWorkingHoursRequest {
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

export interface IProviderScheduleRequest {
    start: string;
    end: string;
}