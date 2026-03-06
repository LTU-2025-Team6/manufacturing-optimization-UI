/**
 * Current simulation time information.
 * Matches backend SimulationTimeDto exactly.
 */
export interface ISimulationTime {
  simulatedUtcNow: string; // UTC ISO string, always ends with Z
  speedMultiplier: number;
}

/**
 * Request to set simulation time.
 */
export interface ISetSimulationTimeRequest {
  simulatedUtcNow?: string;
  speedMultiplier?: number;
}
