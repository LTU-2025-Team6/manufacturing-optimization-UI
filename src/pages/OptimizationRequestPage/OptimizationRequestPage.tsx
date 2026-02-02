import { ReactElement, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IOptimizationRequest } from '../../types/IOptimizationRequest';
import { useRequestOptimizationPlan } from '../../hooks/api/optimizationApi';
import { usePollingApi } from '../../hooks/api/usePollingApi';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';
import { useSelectStrategy } from '../../hooks/api/optimizationApi';
import OptimizationRequestForm from '../../components/OptimizationRequestForm/OptimizationRequestForm';
import OptimizationPollingStatus from '../../components/OptimizationPollingStatus/OptimizationPollingStatus';
import StrategySelector from '../../components/StrategySelector/StrategySelector';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import Loading from '../../components/loading/Loading';
import { generateRandomRequest } from '../../utils/requestGenerator';

type Step = 'form' | 'polling' | 'strategies' | 'plan';

const OptimizationRequestPage = (): ReactElement => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('form');
    const [requestId, setRequestId] = useState<string>('');
    const [plan, setPlan] = useState<IOptimizationPlan | null>(null);
    const [request] = useState<IOptimizationRequest>(() => generateRandomRequest());
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const { callApi: submitRequest, loading: submitting, error: submitError } = useRequestOptimizationPlan();
    const { callApi: selectStrategy, loading: selecting, error: selectError } = useSelectStrategy();

    const { 
        data: pollingData, 
        loading: polling, 
        error: pollingError, 
        elapsed, 
        isTimeout,
        stop: stopPolling
    } = usePollingApi<IOptimizationPlan>(
        { url: `/api/optimization-requests/${requestId}/plan` },
        { 
            interval: 2000, 
            timeout: 600000, 
            immediate: step === 'polling' || isSelecting,
            stopCondition: (data) => {
                // Stop polling if we got strategies to select or if optimization failed
                return (data.status === 'AwaitingStrategySelection' && data.strategies?.length > 0) 
                    || data.status === 'Failed'
                    || !!data.selectedStrategy;
            }
        }
    );

    const handleSubmit = async () => {
        try {
            const id = await submitRequest(request);
            setRequestId(id);
            setStep('polling');
        } catch (err) {
            console.error('Failed to submit request:', err);
        }
    };

    // Handle polling data updates
    useEffect(() => {
        if (step === 'polling' && pollingData) {
            if (pollingData.status === 'AwaitingStrategySelection' && pollingData.strategies?.length) {
                setPlan(pollingData);
                setStep('strategies');
                stopPolling();
            } else if (pollingData.status === 'Failed') {
                setPlan(pollingData);
                stopPolling();
            }
        }
    }, [step, pollingData, stopPolling]);

    // Handle strategy selection completion
    useEffect(() => {
        if (isSelecting && pollingData && pollingData.selectedStrategy) {
            setPlan(pollingData);
            setIsSelecting(false);
            stopPolling();
            // Navigate to plan view
            navigate(`/plan/${requestId}`);
        }
    }, [isSelecting, pollingData, stopPolling, navigate, requestId]);

    const handleSelectStrategy = async (index: number) => {
        if (!plan || !plan.strategies) return;
        
        setSelectedIndex(index);
        const strategy = plan.strategies[index];
        
        try {
            await selectStrategy(requestId, strategy.id);
            setIsSelecting(true);
        } catch (err) {
            console.error('Failed to select strategy:', err);
        }
    };

    return (
        <div className='optimization-request-view'>
            {step === 'form' && (
                <>
                    <h1>Submit Optimization Request</h1>
                    <OptimizationRequestForm request={request} />
                    {submitError && (
                        <Alert variant="error" title={submitError.title || 'Error'}>
                            {submitError.detail && <p>{submitError.detail}</p>}
                            {submitError.status && <p>Status code: {submitError.status}</p>}
                        </Alert>
                    )}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <Button onClick={handleSubmit} loading={submitting}>Submit Request</Button>
                    </div>
                </>
            )}

            {step === 'polling' && (
                <>
                    <h1>Waiting for Plan</h1>
                    <OptimizationPollingStatus 
                        requestId={requestId}
                        status={pollingData?.status}
                        elapsed={elapsed}
                        loading={polling}
                        error={pollingError}
                        isTimeout={isTimeout}
                        errorMessage={pollingData?.errorMessage}
                    />
                </>
            )}

            {step === 'strategies' && plan && plan.strategies && (
                <>
                    <h1>Available Optimization Strategies</h1>
                    {isSelecting ? (
                        <>
                            <h2>Waiting for optimization plan...</h2>
                            {polling && <Loading message="Generating plan..." />}
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </>
            )}

        </div>
    );
};

export default OptimizationRequestPage;