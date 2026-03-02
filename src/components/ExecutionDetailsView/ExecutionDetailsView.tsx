import { ReactElement } from 'react';
import { IExecutionDetails, ProposalStatus } from '../../types/IExecutionDetails';
import { ProcessTypeLabels } from '../../types/ProcessType';
import { formatDateTime } from '../../utils/dateTimeUtils';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import DataState from '../DataState/DataState';
import './ExecutionDetailsView.css';

interface ExecutionDetailsViewProps {
    executionDetails: IExecutionDetails | null;
    loading: boolean;
    error: any;
}

const getStatusBadgeClass = (status: ProposalStatus): string => {
    switch (status) {
        case ProposalStatus.Completed:
            return 'status-badge-completed';
        case ProposalStatus.InProgress:
            return 'status-badge-inprogress';
        case ProposalStatus.Accepted:
            return 'status-badge-accepted';
        case ProposalStatus.Pending:
            return 'status-badge-pending';
        case ProposalStatus.Rejected:
        case ProposalStatus.Failed:
            return 'status-badge-failed';
        default:
            return 'status-badge-default';
    }
};

export default function ExecutionDetailsView({ executionDetails, loading, error }: ExecutionDetailsViewProps): ReactElement {
    return (
        <DataState
            loading={loading}
            error={error}
            data={executionDetails}
            loadingMessage="Loading execution details..."
            emptyMessage="No execution details found"
        >
            {(details) => (
                <div className="execution-details">
                    {/* Status & Process Info */}
                    <div className="execution-header">
                        <div className="execution-info-row">
                            <div className="execution-info-item">
                                <MaterialIcon icon="category" />
                                <div>
                                    <span className="info-label">Process Type</span>
                                    <span className="info-value">{ProcessTypeLabels[details.process] || details.process}</span>
                                </div>
                            </div>
                            <div className="execution-info-item">
                                <MaterialIcon icon="flag" />
                                <div>
                                    <span className="info-label">Status</span>
                                    <span className={`status-badge ${getStatusBadgeClass(details.status)}`}>
                                        {details.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <section className="execution-section">
                        <h3 className="section-title">
                            <MaterialIcon icon="schedule" />
                            Timeline
                        </h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Arrived At</span>
                                <span className="info-value">{formatDateTime(details.arrivedAt)}</span>
                            </div>
                            {details.modifiedAt && (
                                <div className="info-item">
                                    <span className="info-label">Last Modified</span>
                                    <span className="info-value">{formatDateTime(details.modifiedAt)}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Motor Specifications */}
                    <section className="execution-section">
                        <h3 className="section-title">
                            <MaterialIcon icon="settings" />
                            Motor Specifications
                        </h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Power</span>
                                <span className="info-value">{details.motorSpecs.powerKW} kW</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Axis Height</span>
                                <span className="info-value">{details.motorSpecs.axisHeightMM} mm</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Current Efficiency</span>
                                <span className="info-value">{details.motorSpecs.currentEfficiency}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Target Efficiency</span>
                                <span className="info-value">{details.motorSpecs.targetEfficiency}</span>
                            </div>
                            {details.motorSpecs.malfunctionDescription && (
                                <div className="info-item info-item-full">
                                    <span className="info-label">Malfunction Description</span>
                                    <span className="info-value">{details.motorSpecs.malfunctionDescription}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Process Estimate */}
                    {details.estimate && (
                        <section className="execution-section">
                            <h3 className="section-title">
                                <MaterialIcon icon="analytics" />
                                Process Estimate
                            </h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Cost</span>
                                    <span className="info-value">€{details.estimate.cost.toFixed(2)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Duration</span>
                                    <span className="info-value">{details.estimate.duration.toFixed(1)}h</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Quality Score</span>
                                    <span className="info-value">{(details.estimate.qualityScore * 100).toFixed(0)}%</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Emissions</span>
                                    <span className="info-value">{details.estimate.emissionsKgCO2.toFixed(2)} kg CO₂</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Schedule Segments */}
                    {details.scheduleSegments.length > 0 && (
                        <section className="execution-section">
                            <h3 className="section-title">
                                <MaterialIcon icon="event" />
                                Schedule Segments ({details.scheduleSegments.length})
                            </h3>
                            <div className="segments-list">
                                {details.scheduleSegments.map((segment, index) => (
                                    <div key={segment.id} className="segment-item">
                                        <span className="segment-index">{index + 1}</span>
                                        <div className="segment-time">
                                            <MaterialIcon icon="access_time" />
                                            <span>{formatDateTime(segment.startTime)}</span>
                                        </div>
                                        <MaterialIcon icon="arrow_forward" />
                                        <div className="segment-time">
                                            <MaterialIcon icon="access_time" />
                                            <span>{formatDateTime(segment.endTime)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* IDs Section */}
                    <section className="execution-section">
                        <h3 className="section-title">
                            <MaterialIcon icon="fingerprint" />
                            Identifiers
                        </h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Execution ID</span>
                                <span className="info-value-mono">{details.executionId.slice(0, 8)}...</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Proposal ID</span>
                                <span className="info-value-mono">{details.proposalId.slice(0, 8)}...</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Plan ID</span>
                                <span className="info-value-mono">{details.planId.slice(0, 8)}...</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Provider ID</span>
                                <span className="info-value-mono">{details.providerId.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </DataState>
    );
}
