export interface ISimulationTime {
    simulatedUtcNow: string;
    speedMultiplier: number;
}

export interface ISetSimulationTimeRequest {
    simulatedUtcNow?: string;
    speedMultiplier?: number;
}
