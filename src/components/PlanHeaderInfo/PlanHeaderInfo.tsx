import { ReactElement } from 'react';
import { formatDateTime } from '../../utils/dateTimeUtils';
import StatusBadge from '../StatusBadge/StatusBadge';
import './PlanHeaderInfo.css';

interface PlanHeaderInfoProps {
    planId: string;
    status: string;
    createdAt: string;
    confirmedAt?: string;
    strategiesCount?: number;
}

export default function PlanHeaderInfo({ 
    planId, 
    status, 
    createdAt, 
    confirmedAt, 
    strategiesCount 
}: PlanHeaderInfoProps): ReactElement {
    return (
        <div className="plan-header-info">
            <div className="plan-info-grid">
                <div className="plan-info-item">
                    <span className="plan-info-label">Plan ID</span>
                    <span className="plan-info-value plan-id-mono">#{planId.slice(0, 8)}</span>
                </div>
                <div className="plan-info-item">
                    <span className="plan-info-label">Status</span>
                    <StatusBadge status={status} />
                </div>
                {strategiesCount !== undefined && (
                    <div className="plan-info-item">
                        <span className="plan-info-label">Strategies Found</span>
                        <span className="plan-info-value">{strategiesCount}</span>
                    </div>
                )}
                <div className="plan-info-item">
                    <span className="plan-info-label">Created</span>
                    <span className="plan-info-value">{formatDateTime(createdAt, { year: 'numeric' })}</span>
                </div>
                {confirmedAt && (
                    <div className="plan-info-item">
                        <span className="plan-info-label">Confirmed</span>
                        <span className="plan-info-value">{formatDateTime(confirmedAt, { year: 'numeric' })}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
