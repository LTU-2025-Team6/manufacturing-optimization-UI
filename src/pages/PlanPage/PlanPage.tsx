import { ReactElement, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IOptimizationPlan, IOptimizationRequest } from '../../types';
import { usePollingApi } from '../../hooks/api/usePollingApi';
import { useConfirmStrategy, useGetOptimizationRequest, useCancelOptimizationPlan, useDeleteOptimizationPlan } from '../../hooks/api/optimizationApi';
import StrategyCard from '../../components/StrategyCard/StrategyCard';
import StrategySelector from '../../components/StrategySelector/StrategySelector';
import OptimizationPollingStatus from '../../components/OptimizationPollingStatus/OptimizationPollingStatus';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import RequestDetailsCard from '../../components/RequestDetailsCard/RequestDetailsCard';
import PlanHeaderInfo from '../../components/PlanHeaderInfo/PlanHeaderInfo';
import './PlanPage.css';
import { useSelectStrategy } from '../../hooks/api/planApi';

// Constants
const POLLING_INTERVAL = 2000; // 2 seconds
const POLLING_TIMEOUT = 600000; // 10 minutes

export default function PlanPage(): ReactElement {
    const { planId } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    
    // State
    const [plan, setPlan] = useState<IOptimizationPlan | null>(null);
    const [request, setRequest] = useState<IOptimizationRequest | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmationErrors, setConfirmationErrors] = useState<string[] | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    // API Hooks
    const { callApi: selectStrategy, loading: selecting, error: selectError } = useSelectStrategy();
    const { data: confirmResult, callApi: confirmStrategy, loading: confirming, error: confirmError } = useConfirmStrategy();
    const { data: requestData, callApi: fetchRequest } = useGetOptimizationRequest();
    const { callApi: cancelPlan, loading: canceling, error: cancelError } = useCancelOptimizationPlan();
    const { callApi: deletePlan, loading: deleting, error: deleteError } = useDeleteOptimizationPlan();

    // Determine when to stop polling
    const shouldStopPolling = (data: IOptimizationPlan): boolean => {
        // Continue polling if selecting a strategy
        if (isSelecting) {
            return data.status === 'Ready' || data.status === 'Confirmed' || data.status === 'Failed';
        }
        
        // Continue polling if confirming a strategy
        if (isConfirming) {
            return data.status === 'Confirmed' || data.status === 'Failed';
        }
        
        // Stop polling for final states
        if (data.status === 'AwaitingStrategySelection') {
            // Only stop when strategies are ready to display
            return (data.strategies?.length ?? 0) > 0;
        }
        return data.status === 'Ready' ||
               data.status === 'Confirmed' || 
               data.status === 'InProgress' ||
               data.status === 'Completed' ||
               data.status === 'Failed';
    };

    const { 
        data: pollingData, 
        loading: polling, 
        error: pollingError, 
        elapsed, 
        isTimeout,
        restart: restartPolling
    } = usePollingApi<IOptimizationPlan>(
        { url: `/api/plans/${planId}` },
        { 
            interval: POLLING_INTERVAL, 
            timeout: POLLING_TIMEOUT, 
            immediate: true,
            stopCondition: shouldStopPolling
        }
    );

    // Handle strategy selection
    const handleSelectStrategy = async (index: number): Promise<void> => {
        if (!plan?.strategies || !planId) return;
        
        setSelectedIndex(index);
        const selectedStrategy = plan.strategies[index];
        
        try {
            setIsSelecting(true);
            restartPolling();
            selectStrategy(planId, selectedStrategy.id).catch(err => {
                console.error('Failed to select strategy:', err);
                setIsSelecting(false);
            });
        } catch (err) {
            console.error('Failed to select strategy:', err);
            setIsSelecting(false);
        }
    };

    // Handle strategy confirmation
    const handleConfirmStrategy = async (): Promise<void> => {
        if (!plan?.selectedStrategy) return;
        
        try {
            setIsConfirming(true);
            setConfirmationErrors(null);
            restartPolling();
            await confirmStrategy(plan.selectedStrategy.id);
        } catch (err) {
            console.error('Failed to confirm strategy:', err);
            setIsConfirming(false);
        }
    };

    // Handle plan cancellation (Confirmed → Ready)
    const handleCancelPlan = async (): Promise<void> => {
        if (!plan?.id) return;
        
        if (!window.confirm('Are you sure you want to cancel this confirmed plan? This will move it back to Ready status.')) {
            return;
        }
        
        try {
            await cancelPlan(plan.id);
            // Restart polling to fetch updated plan status
            restartPolling();
        } catch (err) {
            console.error('Failed to cancel plan:', err);
        }
    };

    // Handle plan deletion
    const handleDeletePlan = async (): Promise<void> => {
        if (!plan?.id) return;
        
        if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
            return;
        }
        
        try {
            await deletePlan(plan.id);
            // Redirect to plans list after successful deletion
            navigate('/plans');
        } catch (err) {
            console.error('Failed to delete plan:', err);
        }
    };

    // Fetch request details when planId is available
    useEffect(() => {
        if (plan?.requestId) {
            fetchRequest(plan.requestId);
        }
    }, [plan?.requestId]);

    // Update request state when data is fetched
    useEffect(() => {
        if (requestData) {
            setRequest(requestData);
        }
    }, [requestData]);

    // Update plan when polling data changes
    useEffect(() => {
        if (!pollingData) return;
        setPlan(pollingData);
        setHasLoadedOnce(true);

        // Exit selecting mode when done
        if (isSelecting && (pollingData.status === 'Ready' || pollingData.status === 'Confirmed' || pollingData.status === 'Failed')) {
            setIsSelecting(false);
        }
        
        // Exit confirming mode when done
        if (isConfirming && (pollingData.status === 'Confirmed' || pollingData.status === 'InProgress' || pollingData.status === 'Completed' || pollingData.status === 'Failed')) {
            setIsConfirming(false);
        }
    }, [pollingData, isSelecting, isConfirming]);
    
    // Handle confirmation result
    useEffect(() => {
        if (confirmResult) {
            if (!confirmResult.success && confirmResult.errorMessage) {
                setConfirmationErrors([confirmResult.errorMessage]);
            } else if (confirmResult.success) {
                // Refresh plan data after successful confirmation
                // The polling will pick up the updated plan
                setConfirmationErrors([]);
            }
        }
    }, [confirmResult]);

    // === RENDER LOGIC ===
    if (pollingError && !hasLoadedOnce) {
        return (
            <div>
                <h1>Error Loading Plan</h1>
                <Alert variant="error" title={pollingError.title || 'Error'}>
                    {pollingError.detail && <p>{pollingError.detail}</p>}
                    {pollingError.status && <p>Status code: {pollingError.status}</p>}
                </Alert>
            </div>
        );
    }

    if (isTimeout) {
        return (
            <div>
                <h1>Request Timeout</h1>
                <Alert variant="error" title="Timeout">
                    <p>The optimization request took too long to process. Please try again.</p>
                </Alert>
            </div>
        );
    }

    if (!plan) {
        return (
            <div>
                <h1>Loading Plan</h1>
                <OptimizationPollingStatus 
                    planId={planId || ''}
                    status={pollingData?.status}
                    elapsed={elapsed}
                    error={pollingError}
                    isTimeout={isTimeout}
                />
            </div>
        );
    }

    if (plan.status === 'Failed') {
        return (
            <div>
                <div className="plan-action-header">
                    <h1>Optimization Failed</h1>
                    <div className="plan-action-buttons">
                        <Button
                            variant="danger"
                            onClick={handleDeletePlan}
                            disabled={deleting}
                        >
                            <MaterialIcon icon="delete" />
                            {deleting ? 'Deleting...' : 'Delete Plan'}
                        </Button>
                    </div>
                </div>
                
                <PlanHeaderInfo
                    planId={plan.id}
                    status={plan.status}
                    createdAt={plan.createdAt}
                />
                
                <Alert variant="error" title="Optimization Failed">
                    <p>{plan.errorMessage || 'The optimization process failed.'}</p>
                </Alert>

                {deleteError && (
                    <Alert variant="error" title={deleteError.title || 'Delete Failed'}>
                        {deleteError.detail && <p>{deleteError.detail}</p>}
                        {deleteError.status && <p>Status code: {deleteError.status}</p>}
                    </Alert>
                )}

                {request && <RequestDetailsCard request={request} />}
            </div>
        );
    }

    if (plan.status === 'Ready' && plan.selectedStrategy) {
        return (
            <div>
                <div className="plan-action-header">
                    <h1>Ready to Confirm Strategy</h1>
                    <div className="plan-action-buttons">
                        <Button
                            variant="danger"
                            onClick={handleDeletePlan}
                            disabled={deleting}
                        >
                            <MaterialIcon icon="delete" />
                            {deleting ? 'Deleting...' : 'Delete Plan'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate(`/plan/${planId}/edit`)}
                        >
                            <MaterialIcon icon="edit" />
                            Edit Strategy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmStrategy}
                            disabled={confirming || isConfirming}
                        >
                            <MaterialIcon icon="check_circle" />
                            {confirming || isConfirming ? 'Confirming...' : 'Confirm Strategy'}
                        </Button>
                    </div>
                </div>

                <PlanHeaderInfo
                    planId={plan.id}
                    status={plan.status}
                    createdAt={plan.createdAt}
                />

                {request && <RequestDetailsCard request={request} />}
                
                {confirmationErrors && confirmationErrors.length > 0 && (
                    <Alert variant="error" title="Confirmation Errors">
                        <p>Some providers declined or did not respond:</p>
                        <ul>
                            {confirmationErrors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}
                
                {confirmError && (
                    <Alert variant="error" title={confirmError.title || 'Confirmation Failed'}>
                        {confirmError.detail && <p>{confirmError.detail}</p>}
                        {confirmError.status && <p>Status code: {confirmError.status}</p>}
                    </Alert>
                )}

                {deleteError && (
                    <Alert variant="error" title={deleteError.title || 'Delete Failed'}>
                        {deleteError.detail && <p>{deleteError.detail}</p>}
                        {deleteError.status && <p>Status code: {deleteError.status}</p>}
                    </Alert>
                )}
                
                <StrategyCard strategy={plan.selectedStrategy} />

                <Alert variant="info" title="Strategy Ready">
                    <p>Review the strategy and click "Confirm Strategy" to finalize and lock the plan.</p>
                    <p><strong>Note:</strong> Once confirmed, the strategy cannot be modified.</p>
                </Alert>
            </div>
        );
    }

    if (plan.status === 'Confirmed' && plan.selectedStrategy) {
        return (
            <div>
                <div className="plan-action-header">
                    <h1>Confirmed Optimization Plan</h1>
                    <div className="plan-action-buttons">
                        <Button
                            variant="secondary"
                            onClick={handleCancelPlan}
                            disabled={canceling}
                        >
                            <MaterialIcon icon="cancel" />
                            {canceling ? 'Canceling...' : 'Cancel Plan'}
                        </Button>
                    </div>
                </div>

                <PlanHeaderInfo
                    planId={plan.id}
                    status={plan.status}
                    createdAt={plan.createdAt}
                    confirmedAt={plan.confirmedAt}
                />

                {request && <RequestDetailsCard request={request} />}
                
                <StrategyCard strategy={plan.selectedStrategy} />

                <Alert variant="success" title="Plan Confirmed and Locked">
                    <p>Your optimization plan has been confirmed and is ready for execution.</p>
                    <p><strong>Note:</strong> This strategy is now locked and cannot be modified.</p>
                </Alert>

                {cancelError && (
                    <Alert variant="error" title={cancelError.title || 'Cancel Failed'}>
                        {cancelError.detail && <p>{cancelError.detail}</p>}
                        {cancelError.status && <p>Status code: {cancelError.status}</p>}
                    </Alert>
                )}
            </div>
        );
    }

    if ((plan.status === 'InProgress' || plan.status === 'Completed') && plan.selectedStrategy) {
        return (
            <div>
                <div className="plan-action-header">
                    <h1>{plan.status === 'Completed' ? 'Completed Optimization Plan' : 'Plan In Progress'}</h1>
                </div>

                <PlanHeaderInfo
                    planId={plan.id}
                    status={plan.status}
                    createdAt={plan.createdAt}
                    confirmedAt={plan.confirmedAt}
                />

                {request && <RequestDetailsCard request={request} />}
                
                <StrategyCard strategy={plan.selectedStrategy} />

                {plan.status === 'Completed' ? (
                    <Alert variant="success" title="Plan Execution Completed">
                        <p>Your optimization plan has been successfully executed and completed.</p>
                        <p>You can view the execution details in the Executions page.</p>
                    </Alert>
                ) : (
                    <Alert variant="info" title="Plan Execution In Progress">
                        <p>Your optimization plan is currently being executed.</p>
                        <p>You can monitor the progress in the Executions page.</p>
                    </Alert>
                )}
            </div>
        );
    }

    // Ready status without selected strategy (e.g., after cancellation)
    if (plan.status === 'Ready' && !plan.selectedStrategy) {
        return (
            <div>
                <div className="plan-action-header">
                    <h1>Plan Ready</h1>
                    <div className="plan-action-buttons">
                        <Button
                            variant="danger"
                            onClick={handleDeletePlan}
                            disabled={deleting}
                        >
                            <MaterialIcon icon="delete" />
                            {deleting ? 'Deleting...' : 'Delete Plan'}
                        </Button>
                    </div>
                </div>

                <PlanHeaderInfo
                    planId={plan.id}
                    status={plan.status}
                    createdAt={plan.createdAt}
                />

                {request && <RequestDetailsCard request={request} />}

                <Alert variant="warning" title="No Strategy Selected">
                    <p>This plan is in Ready status but no strategy has been selected yet.</p>
                    <p>You can delete this plan or wait for a strategy to be selected.</p>
                </Alert>

                {deleteError && (
                    <Alert variant="error" title={deleteError.title || 'Delete Failed'}>
                        {deleteError.detail && <p>{deleteError.detail}</p>}
                        {deleteError.status && <p>Status code: {deleteError.status}</p>}
                    </Alert>
                )}
            </div>
        );
    }

    if (plan.status === 'AwaitingStrategySelection' && plan.strategies?.length) {
        if (isSelecting) {
            return (
                <div>
                    <h1>Processing Strategy Selection</h1>
                    <OptimizationPollingStatus 
                        planId={planId || ''}
                        status={plan.status}
                        elapsed={elapsed}
                        error={pollingError}
                        isTimeout={isTimeout}
                    />
                </div>
            );
        }

        return (
            <div>
                <h1>Available Optimization Strategies</h1>
                
                <PlanHeaderInfo
                    planId={plan.id}
                    status={plan.status}
                    createdAt={plan.createdAt}
                    strategiesCount={plan.strategies.length}
                />

                {request && <RequestDetailsCard request={request} />}
                
                <StrategySelector 
                    strategies={plan.strategies}
                    onSelect={handleSelectStrategy}
                    selecting={selecting}
                    selectedIndex={selectedIndex}
                />
                
                {selectError && (
                    <Alert variant="error" title={selectError.title || 'Error'}>
                        {selectError.detail && <p>{selectError.detail}</p>}
                        {selectError.status && <p>Status code: {selectError.status}</p>}
                    </Alert>
                )}
            </div>
        );
    }

    // Any other status (processing steps)
    return (
        <div>
            <h1>Processing Optimization Request</h1>
            <OptimizationPollingStatus 
                planId={planId || ''}
                status={plan.status}
                elapsed={elapsed}
                error={pollingError}
                isTimeout={isTimeout}
            />
        </div>
    );
}
