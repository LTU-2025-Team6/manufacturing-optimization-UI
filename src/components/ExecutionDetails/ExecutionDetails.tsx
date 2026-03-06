import { usePlanDetailPolling } from '../../hooks/api/executionApi';
import { ensureUtc } from '../../utils/dateTimeUtils';
import DataState from '../DataState/DataState';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import StatusBadge from '../StatusBadge/StatusBadge';
import ExecutionStepsTimeline from './ExecutionStepsTimeline';
import './ExecutionDetails.css';

interface ExecutionDetailsProps {
    planId: string;
    onClose: () => void;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(ensureUtc(dateString)).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

export default function ExecutionDetails({ planId, onClose }: ExecutionDetailsProps) {
    const { data: execution, loading, error } = usePlanDetailPolling(planId, 2000);

    return (
        <div className="execution-details">
            <div className="execution-details-header">
                <div className="header-content">
                    <div className="header-title">
                        <MaterialIcon icon="assignment" size="L" />
                        <h2>Execution Details</h2>
                    </div>
                    {execution && (
                        <div className="header-meta">
                            <span className="plan-id">ID: {execution.id.substring(0, 8)}</span>
                            <StatusBadge status={execution.status} />
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="close-btn-icon" aria-label="Close">
                    <MaterialIcon icon="close" size="M" />
                </button>
            </div>

            <DataState
                loading={loading}
                error={error}
                data={execution}
                loadingMessage="Loading execution details..."
                emptyMessage="Execution not found"
            >
                {(exec) => (
                    <>
                        {exec.errorMessage && (
                            <div className="error-banner">
                                <MaterialIcon icon="error" size="M" />
                                <div>
                                    <strong>Execution Error:</strong>
                                    <p>{exec.errorMessage}</p>
                                </div>
                            </div>
                        )}

                        <div className="execution-info">
                            <div className="info-item">
                                <MaterialIcon icon="schedule" size="S" />
                                <span className="info-label">Created:</span>
                                <span className="info-value">{formatDate(exec.createdAt)}</span>
                            </div>
                            {exec.confirmedAt && (
                                <div className="info-item">
                                    <MaterialIcon icon="check_circle" size="S" />
                                    <span className="info-label">Confirmed:</span>
                                    <span className="info-value">{formatDate(exec.confirmedAt)}</span>
                                </div>
                            )}
                            {exec.completedAt && (
                                <div className="info-item">
                                    <MaterialIcon icon="done_all" size="S" />
                                    <span className="info-label">Completed:</span>
                                    <span className="info-value">{formatDate(exec.completedAt)}</span>
                                </div>
                            )}
                        </div>

                        <div className="execution-overview">
                            <div className="overview-card">
                                <div className="overview-icon">
                                    <MaterialIcon icon="list" size="M" />
                                </div>
                                <div className="overview-content">
                                    <div className="overview-label">Total Steps</div>
                                    <div className="overview-value">{exec.totalSteps}</div>
                                </div>
                            </div>
                            <div className="overview-card success">
                                <div className="overview-icon">
                                    <MaterialIcon icon="check_circle" size="M" />
                                </div>
                                <div className="overview-content">
                                    <div className="overview-label">Completed</div>
                                    <div className="overview-value">{exec.completedSteps}</div>
                                </div>
                            </div>
                            {exec.inProgressSteps > 0 && (
                                <div className="overview-card warning">
                                    <div className="overview-icon">
                                        <MaterialIcon icon="pending" size="M" />
                                    </div>
                                    <div className="overview-content">
                                        <div className="overview-label">In Progress</div>
                                        <div className="overview-value">{exec.inProgressSteps}</div>
                                    </div>
                                </div>
                            )}
                            {exec.failedSteps > 0 && (
                                <div className="overview-card error">
                                    <div className="overview-icon">
                                        <MaterialIcon icon="error" size="M" />
                                    </div>
                                    <div className="overview-content">
                                        <div className="overview-label">Failed</div>
                                        <div className="overview-value">{exec.failedSteps}</div>
                                    </div>
                                </div>
                            )}
                            {exec.pendingSteps > 0 && (
                                <div className="overview-card">
                                    <div className="overview-icon">
                                        <MaterialIcon icon="schedule" size="M" />
                                    </div>
                                    <div className="overview-content">
                                        <div className="overview-label">Pending</div>
                                        <div className="overview-value">{exec.pendingSteps}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="progress-section">
                            <div className="progress-header">
                                <span className="progress-label">Overall Progress</span>
                                <span className="progress-percentage">{exec.progressPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${exec.progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="execution-timeline-section">
                            <div className="timeline-header">
                                <MaterialIcon icon="timeline" size="M" />
                                <h3>Execution Timeline</h3>
                            </div>
                            <ExecutionStepsTimeline steps={exec.steps} />
                        </div>
                    </>
                )}
            </DataState>
        </div>
    );
}

