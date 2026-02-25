import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export interface ExecutionEventPayload {
    planId: string;
    strategyId: string;
    stepId: string;
    stepNumber: number;
    success?: boolean; // Available on StepCompleted
    errorMessage?: string;
}

export function useExecutionSignalR() {
    const [lastStartedStep, setLastStartedStep] = useState<ExecutionEventPayload | null>(null);
    const [lastCompletedStep, setLastCompletedStep] = useState<ExecutionEventPayload | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Connecting');

    useEffect(() => {
        // Connect to the Gateway's SignalR Hub
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/hubs/execution", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("StepStarted", (data: ExecutionEventPayload) => {
            console.log("📡 SignalR StepStarted:", data);
            setLastStartedStep(data);
        });

        connection.on("StepCompleted", (data: ExecutionEventPayload) => {
            console.log("📡 SignalR StepCompleted:", data);
            setLastCompletedStep(data);
        });

        const startConnection = async () => {
            try {
                await connection.start();
                setConnectionStatus('Connected');
                console.log("🟢 SignalR Connected");
            } catch (err) {
                console.error("🔴 SignalR Connection Error: ", err);
                setConnectionStatus('Disconnected');
                setTimeout(startConnection, 5000);
            }
        };

        startConnection();

        return () => {
            connection.stop();
        };
    }, []);

    return { lastStartedStep, lastCompletedStep, connectionStatus };
}