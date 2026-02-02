import { IOptimizationRequest } from '../types/IOptimizationRequest';

export function generateRandomRequest(): IOptimizationRequest {
    const efficiencyClasses = ['IE1', 'IE2', 'IE3', 'IE4'];
    const startTime = new Date(Date.now() + Math.random() * 100 * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + (100 + Math.random() * 200) * 60 * 60 * 1000);

    return {
        customerId: crypto.randomUUID(),
        motorSpecs: {
            powerKW: 50 + Math.floor(Math.random() * 150),
            axisHeightMM: 63 + Math.floor(Math.random() * 252),
            currentEfficiency: efficiencyClasses[Math.floor(Math.random() * efficiencyClasses.length)],
            targetEfficiency: efficiencyClasses[Math.floor(Math.random() * efficiencyClasses.length)],
            malfunctionDescription: Math.random() > 0.5 ? 'Normal operation' : 'Reduced efficiency, overheating'
        },
        constraints: {
            maxBudget: Math.random() > 0.33 ? undefined : 5000 + Math.floor(Math.random() * 15000),
            timeWindow: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            }
        },
        createdAt: new Date().toISOString()
    };
}
