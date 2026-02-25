import { ReactElement, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';
import { formatDateTime } from '../../utils/dateTimeUtils';
import StrategyCard from '../../components/StrategyCard/StrategyCard';
import Alert from '../../components/Alert/Alert';
import Loading from '../../components/Loading/Loading';
import { useApi } from '../../hooks/api/useApi';
import { ExecutionTimeline } from '../../components/ExecutionTimeline/ExecutionTimeline';
import { useExecutionSignalR } from '../../hooks/api/useExecutionSignalR'; // Add this import

export default function PlanView(): ReactElement {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    
    // We fetch the initial data using useApi, but we need local state to 
    // update the UI in real-time when SignalR messages arrive.
    const { data: initialPlan, loading, error, callApi } = useApi<IOptimizationPlan>();
    const [plan, setPlan] = useState<IOptimizationPlan | null>(null);

    // Initialize SignalR
    const { lastStartedStep, lastCompletedStep, connectionStatus } = useExecutionSignalR();

    // Fetch initial plan data
    useEffect(() => {
        if (requestId) {
            callApi({ url: `/api/optimization-requests/${requestId}/plan` });
        }
    }, [requestId, callApi]);

    // When the initial fetch finishes, set our local state
    useEffect(() => {
        if (initialPlan) {
            setPlan(initialPlan);
        }
    }, [initialPlan]);

    // Handle real-time "StepStarted" events
    useEffect(() => {
        if (!plan || !plan.selectedStrategy || !lastStartedStep) return;

        if (lastStartedStep.planId === plan.id) {
            setPlan(currentPlan => {
                if (!currentPlan?.selectedStrategy) return currentPlan;
                
                const updatedSteps = currentPlan.selectedStrategy.steps.map(step => 
                    step.id === lastStartedStep.stepId 
                        ? { ...step, executionStatus: 'InProgress' as const } 
                        : step
                );

                return {
                    ...currentPlan,
                    selectedStrategy: {
                        ...currentPlan.selectedStrategy,
                        steps: updatedSteps
                    }
                };
            });
        }
    }, [lastStartedStep]);

    // Handle real-time "StepCompleted" events
    useEffect(() => {
        if (!plan || !plan.selectedStrategy || !lastCompletedStep) return;

        if (lastCompletedStep.planId === plan.id) {
            setPlan(currentPlan => {
                if (!currentPlan?.selectedStrategy) return currentPlan;
                
                const updatedSteps = currentPlan.selectedStrategy.steps.map(step => 
                    step.id === lastCompletedStep.stepId 
                        ? { ...step, executionStatus: lastCompletedStep.success ? 'Completed' as const : 'Failed' as const } 
                        : step
                );

                return {
                    ...currentPlan,
                    selectedStrategy: {
                        ...currentPlan.selectedStrategy,
                        steps: updatedSteps
                    }
                };
            });
        }
    }, [lastCompletedStep]);

    if (loading && !plan) {
        return <Loading message="Loading plan..." />;
    }

    if (error) {
        return (
            <div>
                <h1>Error Loading Plan</h1>
                <Alert variant="error" title={error.title || 'Error'}>
                    {error.detail && <p>{error.detail}</p>}
                    {error.status && <p>Status code: {error.status}</p>}
                </Alert>
            </div>
        );
    }

    if (!plan) {
        return (
            <div>
                <h1>Plan Not Found</h1>
                <p>Unable to load the optimization plan.</p>
            </div>
        );
    }

    if (plan.status === 'Failed') {
        return (
            <div>
                <h1>Optimization Failed</h1>
                <Alert variant="error" title="Optimization Failed">
                    <p>{plan.errorMessage || 'The optimization process failed.'}</p>
                </Alert>
            </div>
        );
    }

    if (plan.status === 'AwaitingStrategySelection') {
        return (
            <div>
                <h1>Awaiting Strategy Selection</h1>
                <Alert variant="warning" title="Strategy Not Selected">
                    <p>Please select a strategy to continue.</p>
                </Alert>
            </div>
        );
    }

    if (!plan.selectedStrategy) {
        return (
            <div>
                <h1>Plan Not Ready</h1>
                <Alert variant="warning" title="No Strategy Selected">
                    <p>No strategy has been selected yet.</p>
                </Alert>
            </div>
        );
    }

    return (
        <div>
            <h1>Final Optimization Plan</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p><strong>Plan ID:</strong> {plan.id}</p>
                    <p><strong>Request ID:</strong> {plan.requestId}</p>
                    <p><strong>Status:</strong> <span className="status-success">{plan.status}</span></p>
                    <p><strong>Created:</strong> {formatDateTime(plan.createdAt, { year: 'numeric' })}</p>
                </div>
                <div>
                    {/* Tiny visual indicator of WebSocket connection status */}
                    <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8em',
                        backgroundColor: connectionStatus === 'Connected' ? '#d4edda' : '#f8d7da',
                        color: connectionStatus === 'Connected' ? '#155724' : '#721c24'
                    }}>
                        {connectionStatus === 'Connected' ? '🟢 Live Updates Active' : '🔴 Connecting...'}
                    </span>
                </div>
            </div>
            
            {/* Show Strategy details as you did before */}
            <StrategyCard strategy={plan.selectedStrategy} />

            <div style={{ marginTop: '2rem' }}>
                <h2>Live Execution Timeline</h2>
                <ExecutionTimeline steps={plan.selectedStrategy.steps} />
            </div>

            <Alert variant="success" title="Plan Ready for Execution">
                <p>Your optimization plan has been successfully generated.</p>
            </Alert>
        </div>
    );
}