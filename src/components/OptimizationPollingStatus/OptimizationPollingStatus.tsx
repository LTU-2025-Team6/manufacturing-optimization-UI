import { IProblemDetails } from '../../types';
import Alert from '../Alert/Alert';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './OptimizationPollingStatus.css';

const STATUS_STEPS = [
    { status: 'Draft', label: 'Draft', icon: 'auto_awesome' },
    { status: 'MatchingWorkflow', label: 'Matching Workflow', icon: 'auto_awesome' },
    { status: 'MatchingProviders', label: 'Matching Providers', icon: 'auto_awesome' },
    { status: 'EstimatingCosts', label: 'Estimating Costs', icon: 'auto_awesome' },
    { status: 'GeneratingStrategies', label: 'Generating Strategies', icon: 'auto_awesome' },
    { status: 'AwaitingStrategySelection', label: 'Strategy Selection', icon: 'auto_awesome' },
];

const STATUS_LABELS: Record<string, string> = {
    Draft: 'Draft',
    MatchingWorkflow: 'Matching Workflow',
    MatchingProviders: 'Matching Providers',
    EstimatingCosts: 'Estimating Costs',
    GeneratingStrategies: 'Generating Strategies',
    AwaitingStrategySelection: 'Awaiting Strategy Selection',
    StrategySelected: 'Strategy Selected',
    Ready: 'Ready',
    Confirmed: 'Confirmed',
    InProgress: 'In Progress',
    Completed: 'Completed',
    Failed: 'Failed',
};

interface PollingStatusProps {
    planId: string;
    status?: string;
    elapsed: number;
    error: IProblemDetails | null;
    isTimeout: boolean;
}

export default function OptimizationPollingStatus({ 
    planId,
    status,
    elapsed, 
    error, 
    isTimeout
}: PollingStatusProps) {
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === status);

    return (
        <div className="polling-status">
            {/* Step Progress */}
            {currentStepIndex >= 0 && (
                <div className="polling-steps">
                    {STATUS_STEPS.map((step, index) => (
                        <div 
                            key={step.status} 
                            className={`polling-step ${
                                index < currentStepIndex ? 'polling-step-done' :
                                index === currentStepIndex ? 'polling-step-active' :
                                'polling-step-pending'
                            }`}
                        >
                            <div className="polling-step-icon">
                                {index < currentStepIndex 
                                    ? <MaterialIcon icon="check_circle" />
                                    : index === currentStepIndex
                                        ? <MaterialIcon icon={step.icon} />
                                        : <MaterialIcon icon="radio_button_unchecked" />
                                }
                            </div>
                            <span className="polling-step-label">{step.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Plan Info Card */}
            <div className="polling-info-card">
                <div className="polling-info-row">
                    <div className="polling-info-item">
                        <MaterialIcon icon="description" />
                        <div className="polling-info-content">
                            <span className="polling-info-label">Plan ID</span>
                            <span className="polling-info-value">{planId.slice(0, 8)}...</span>
                        </div>
                    </div>
                    <div className="polling-info-item">
                        <MaterialIcon icon="schedule" />
                        <div className="polling-info-content">
                            <span className="polling-info-label">Elapsed Time</span>
                            <span className="polling-info-value">{timeDisplay}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Alert variant="error" title={error.title || 'Error'}>
                    {error.detail && <p>{error.detail}</p>}
                    {error.status && <p><strong>Status code:</strong> {error.status}</p>}
                </Alert>
            )}

            {/* Timeout Warning */}
            {isTimeout && (
                <Alert variant="error" title="Request Timeout">
                    <p>The optimization request is taking longer than expected.</p>
                    <p>Please check the request status or try again later.</p>
                </Alert>
            )}
        </div>
    );
}
