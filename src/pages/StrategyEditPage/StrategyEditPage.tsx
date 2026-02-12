import { ReactElement, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/api/useApi';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';
import StrategyEditor from '../../components/StrategyEditor/StrategyEditor';
import Loading from '../../components/loading/Loading';
import Alert from '../../components/Alert/Alert';
import './StrategyEditPage.css';

export default function StrategyEditPage(): ReactElement {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { data: plan, loading, error, callApi } = useApi<IOptimizationPlan>();

    useEffect(() => {
        if (requestId) {
            callApi({ url: `/api/optimization-requests/${requestId}/plan` });
        }
    }, [requestId, callApi]);

    if (loading) {
        return <Loading message="Loading strategy for editing..." />;
    }

    if (error) {
        return (
            <div className="strategy-edit-page-error">
                <Alert variant="error" title={error.title || 'Error Loading Strategy'}>
                    {error.detail && <p>{error.detail}</p>}
                    {error.status && <p>Status code: {error.status}</p>}
                </Alert>
            </div>
        );
    }

    if (!plan || !plan.selectedStrategy) {
        return (
            <div className="strategy-edit-page-error">
                <Alert variant="warning" title="No Strategy Available">
                    <p>No strategy has been selected for this plan.</p>
                    <p>Please select a strategy before attempting to edit.</p>
                </Alert>
            </div>
        );
    }

    if (plan.status === 'Failed') {
        return (
            <div className="strategy-edit-page-error">
                <Alert variant="error" title="Cannot Edit Failed Plan">
                    <p>This optimization plan has failed and cannot be edited.</p>
                </Alert>
            </div>
        );
    }

    if (plan.status === 'Confirmed') {
        return (
            <div className="strategy-edit-page-error">
                <Alert variant="error" title="Cannot Edit Confirmed Strategy">
                    <p>This strategy has been confirmed and locked.</p>
                    <p>Confirmed strategies cannot be modified.</p>
                </Alert>
            </div>
        );
    }

    return (
        <div className="strategy-edit-page">
            <StrategyEditor
                strategy={plan.selectedStrategy}
                requestId={requestId!}
                onCancel={() => navigate(`/plan/${requestId}`)}
            />
        </div>
    );
}
