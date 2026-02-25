import { IProblemDetails } from '../../types/IProblemDetails';
import Alert from '../Alert/Alert';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './OptimizationPollingStatus.css';

interface PollingStatusProps {
    requestId: string;
    elapsed: number;
    error: IProblemDetails | null;
    isTimeout: boolean;
}

export default function OptimizationPollingStatus({ 
    requestId,
    elapsed, 
    error, 
    isTimeout
}: PollingStatusProps) {
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return (
        <div className="polling-status">
            {/* Progress Indicator */}
            <div className="polling-progress">
                <div className="polling-progress-bar">
                    <div className="polling-progress-fill"></div>
                </div>
                <div className="polling-pulse-indicator">
                    <MaterialIcon icon="sync" />
                    <span className="polling-pulse-text">Processing...</span>
                </div>
            </div>

            {/* Request Info Card */}
            <div className="polling-info-card">
                <div className="polling-info-row">
                    <div className="polling-info-item">
                        <MaterialIcon icon="description" />
                        <div className="polling-info-content">
                            <span className="polling-info-label">Request ID</span>
                            <span className="polling-info-value">{requestId.slice(0, 8)}...</span>
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
