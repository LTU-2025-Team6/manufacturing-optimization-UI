import { ReactElement, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';
import { IOptimizationRequest } from '../../types/IOptimizationRequest';
import { usePollingApi } from '../../hooks/api/usePollingApi';
import { useSelectStrategy, useConfirmStrategy, useGetOptimizationRequest } from '../../hooks/api/optimizationApi';
import StrategyCard from '../../components/StrategyCard/StrategyCard';
import StrategySelector from '../../components/StrategySelector/StrategySelector';
import OptimizationPollingStatus from '../../components/OptimizationPollingStatus/OptimizationPollingStatus';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import RequestDetailsCard from '../../components/RequestDetailsCard/RequestDetailsCard';
import PlanHeaderInfo from '../../components/PlanHeaderInfo/PlanHeaderInfo';
import './PlanPage.css';

// Constants
const POLLING_INTERVAL = 2000; // 2 seconds
const POLLING_TIMEOUT = 600000; // 10 minutes

export default function PlanPage(): ReactElement {
    const { requestId } = useParams<{ requestId: string }>();
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
        return data.status === 'AwaitingStrategySelection' || 
               data.status === 'Ready' ||
               data.status === 'Confirmed' || 
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
        { url: `/api/optimization-requests/${requestId}/plan` },
        { 
            interval: POLLING_INTERVAL, 
            timeout: POLLING_TIMEOUT, 
            immediate: true,
            stopCondition: shouldStopPolling
        }
    );

    // Handle strategy selection
    const handleSelectStrategy = async (index: number): Promise<void> => {
        if (!plan?.strategies || !requestId) return;
        
        setSelectedIndex(index);
        const selectedStrategy = plan.strategies[index];
        
        try {
            setIsSelecting(true);
            restartPolling();
            selectStrategy(requestId, selectedStrategy.id).catch(err => {
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

    // Fetch request details when requestId is available
    useEffect(() => {
        if (requestId) {
            fetchRequest(requestId);
        }
    }, [requestId]);

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
        if (isConfirming && (pollingData.status === 'Confirmed' || pollingData.status === 'Failed')) {
            setIsConfirming(false);
        }
    }, [pollingData, isSelecting, isConfirming]);
    
    // Handle confirmation result
    useEffect(() => {
        if (confirmResult) {
            if (confirmResult.confirmationErrors && confirmResult.confirmationErrors.length > 0) {
                setConfirmationErrors(confirmResult.confirmationErrors);
            } else {
                setPlan(confirmResult.confirmedPlan);
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
                    requestId={requestId || ''}
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
                <h1>Optimization Failed</h1>
                
                <PlanHeaderInfo
                    planId={plan.id}
                    status={plan.status}
                    createdAt={plan.createdAt}
                />
                
                <Alert variant="error" title="Optimization Failed">
                    <p>{plan.errorMessage || 'The optimization process failed.'}</p>
                </Alert>

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
                            variant="secondary"
                            onClick={() => navigate(`/plan/${requestId}/edit`)}
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
                <h1>Confirmed Optimization Plan</h1>
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
            </div>
        );
    }

    if (plan.status === 'AwaitingStrategySelection' && plan.strategies?.length) {
        if (isSelecting) {
            return (
                <div>
                    <h1>Processing Strategy Selection</h1>
                    <OptimizationPollingStatus 
                        requestId={requestId || ''}
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

    // Any other status
    return (
        <div>
            <h1>Processing Optimization Request</h1>
            <OptimizationPollingStatus 
                requestId={requestId || ''}
                elapsed={elapsed}
                error={pollingError}
                isTimeout={isTimeout}
            />
        </div>
    );
}
