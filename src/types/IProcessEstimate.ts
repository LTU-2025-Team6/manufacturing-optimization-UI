import { ITimeWindow } from './ITimeWindow';

export interface IProcessEstimate {
    id: string;
    cost: number;
    qualityScore: number;
    emissionsKgCO2: number;
    duration: number;
}
