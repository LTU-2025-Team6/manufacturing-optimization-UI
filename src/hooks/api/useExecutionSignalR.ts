import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export interface ExecutionEventPayload {
    planId: string;
    strategyId: string;
    stepId: string;
    stepNumber: number;
    success?: boolean;
    errorMessage?: string;
}

export interface ExecutionStartedPayload {
    planId: string;
    requestId: string;
    totalSteps: number;
}

export interface ExecutionCompletedPayload {
    planId: string;
    requestId: string;
    totalDuration: string;
}

export function useExecutionSignalR() {
    const [lastStartedStep, setLastStartedStep] = useState<ExecutionEventPayload | null>(null);
    const [lastCompletedStep, setLastCompletedStep] = useState<ExecutionEventPayload | null>(null);
    const [executionStarted, setExecutionStarted] = useState<ExecutionStartedPayload | null>(null);
    const [executionCompleted, setExecutionCompleted] = useState<ExecutionCompletedPayload | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Connecting');

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/hubs/execution", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("StepStarted", (data: ExecutionEventPayload) => {
            console.log("SignalR StepStarted:", data);
            setLastStartedStep(data);
        });

        connection.on("StepCompleted", (data: ExecutionEventPayload) => {
            console.log("SignalR StepCompleted:", data);
            setLastCompletedStep(data);
        });

        connection.on("ExecutionStarted", (data: ExecutionStartedPayload) => {
            console.log("SignalR ExecutionStarted:", data);
            setExecutionStarted(data);
        });

        connection.on("ExecutionCompleted", (data: ExecutionCompletedPayload) => {
            console.log("SignalR ExecutionCompleted:", data);
            setExecutionCompleted(data);
        });

        connection.onreconnecting(() => setConnectionStatus('Connecting'));
        connection.onreconnected(() => setConnectionStatus('Connected'));
        connection.onclose(() => setConnectionStatus('Disconnected'));

        const startConnection = async () => {
            try {
                await connection.start();
                setConnectionStatus('Connected');
                console.log("SignalR Connected");
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
                setConnectionStatus('Disconnected');
                setTimeout(startConnection, 5000);
            }
        };

        startConnection();

        return () => {
            connection.stop();
        };
    }, []);

    return {
        lastStartedStep,
        lastCompletedStep,
        executionStarted,
        executionCompleted,
        connectionStatus
    };
}
