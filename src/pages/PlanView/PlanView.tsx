import { ReactElement, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';
import StrategyCard from '../../components/StrategyCard/StrategyCard';
import Alert from '../../components/Alert/Alert';
import Loading from '../../components/loading/Loading';
import { useApi } from '../../hooks/api/useApi';

export default function PlanView(): ReactElement {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { data: plan, loading, error, callApi } = useApi<IOptimizationPlan>();

    useEffect(() => {
        if (requestId) {
            callApi({ url: `/api/optimization-requests/${requestId}/plan` });
        }
    }, [requestId, callApi]);

    if (loading) {
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

    // Handle different plan statuses
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
