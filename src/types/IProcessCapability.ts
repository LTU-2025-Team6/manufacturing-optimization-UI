export interface IProcessCapability {
    id: string;
    process: string;
    costPerHour: number;
    speedMultiplier: number;
    qualityScore: number;
    energyConsumptionKwhPerHour: number;
    carbonIntensityKgCO2PerKwh: number;
    usesRenewableEnergy: boolean;
}
