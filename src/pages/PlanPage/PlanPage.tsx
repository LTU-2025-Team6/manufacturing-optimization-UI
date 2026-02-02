import { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';
import { usePollingApi } from '../../hooks/api/usePollingApi';
import { useSelectStrategy } from '../../hooks/api/optimizationApi';
import StrategyCard from '../../components/StrategyCard/StrategyCard';
import StrategySelector from '../../components/StrategySelector/StrategySelector';
import OptimizationPollingStatus from '../../components/OptimizationPollingStatus/OptimizationPollingStatus';
import Alert from '../../components/Alert/Alert';

// Constants
const POLLING_INTERVAL = 2000; // 2 seconds
const POLLING_TIMEOUT = 600000; // 10 minutes

export default function PlanPage(): ReactElement {
    const { requestId } = useParams<{ requestId: string }>();
    
    // State
    const [plan, setPlan] = useState<IOptimizationPlan | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    // API Hooks
    const { callApi: selectStrategy, loading: selecting, error: selectError } = useSelectStrategy();

    // Determine when to stop polling
    const shouldStopPolling = (data: IOptimizationPlan): boolean => {
        // Continue polling if selecting a strategy
        if (isSelecting) {
            return data.status === 'Confirmed' || data.status === 'Failed';
        }
        
        // Stop polling for final states
        return data.status === 'AwaitingStrategySelection' || 
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
            immediate: true, // Сразу начинаем поллинг при загрузке
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
            // Сразу запускаем поллинг, не ждем ответа от selectStrategy
            restartPolling();
            // Отправляем выбор стратегии (не блокируем на этом)
            selectStrategy(requestId, selectedStrategy.id).catch(err => {
                console.error('Failed to select strategy:', err);
                setIsSelecting(false);
            });
        } catch (err) {
            console.error('Failed to select strategy:', err);
            setIsSelecting(false);
        }
    };

    // Update plan when polling data changes
    useEffect(() => {
        if (!pollingData) return;
        setPlan(pollingData);
        setHasLoadedOnce(true);

        // Exit selecting mode when done
        if (isSelecting && (pollingData.status === 'Confirmed' || pollingData.status === 'Failed')) {
            setIsSelecting(false);
        }
    }, [pollingData, isSelecting]);

    // === RENDER LOGIC ===

    // Ошибка поллинга
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

    // Таймаут
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

    // План еще не загружен - начальная загрузка
    if (!plan) {
        return (
            <div>
                <h1>Loading Plan</h1>
                <OptimizationPollingStatus 
                    requestId={requestId || ''}
                    status={undefined}
                    elapsed={elapsed}
                    loading={polling}
                    error={pollingError}
                    isTimeout={isTimeout}
                    errorMessage={undefined}
                />
            </div>
        );
    }

    // Plan Failed - показываем ошибку
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

    // Plan Confirmed - показываем готовый план
    if (plan.status === 'Confirmed' && plan.selectedStrategy) {
        return (
            <div>
                <h1>Final Optimization Plan</h1>
                <p><strong>Plan ID:</strong> {plan.id}</p>
                <p><strong>Request ID:</strong> {plan.requestId}</p>
                <p><strong>Status:</strong> <span className="status-success">{plan.status}</span></p>
                <p><strong>Created:</strong> {new Date(plan.createdAt).toLocaleString()}</p>
                
                <StrategyCard strategy={plan.selectedStrategy} />

                <Alert variant="success" title="Plan Ready for Execution">
                    <p>Your optimization plan has been successfully generated.</p>
                </Alert>
            </div>
        );
    }

    // AwaitingStrategySelection - показываем выбор стратегии
    if (plan.status === 'AwaitingStrategySelection' && plan.strategies?.length) {
        // Если в процессе выбора, показываем статус и продолжаем поллинг
        if (isSelecting) {
            return (
                <div>
                    <h1>Processing Strategy Selection</h1>
                    <OptimizationPollingStatus 
                        requestId={requestId || ''}
                        status={plan.status}
                        elapsed={elapsed}
                        loading={polling}
                        error={pollingError}
                        isTimeout={isTimeout}
                        errorMessage={plan.errorMessage}
                    />
                </div>
            );
        }

        // Показываем селектор стратегий
        return (
            <div>
                <h1>Available Optimization Strategies</h1>
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

    // Все остальные статусы - показываем статус и продолжаем поллинг
    return (
        <div>
            <h1>Processing Optimization Request</h1>
            <OptimizationPollingStatus 
                requestId={requestId || ''}
                status={plan.status}
                elapsed={elapsed}
                loading={polling}
                error={pollingError}
                isTimeout={isTimeout}
                errorMessage={plan.errorMessage}
            />
        </div>
    );
}
