/**
 * Current simulation time information.
 */
export interface ISimulationTime {
  simulatedUtcNow: string;
  realUtcNow: string;
  speedMultiplier: number;
  isAccelerated: boolean;
  formattedSimulatedTime: string;
  formattedRealTime: string;
}

/**
 * Request to set simulation time.
 */
export interface ISetSimulationTimeRequest {
  simulatedUtcNow?: string;
  speedMultiplier?: number;
}
