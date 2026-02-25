import { ReactElement } from 'react';
import { IOptimizationRequest } from '../../types/IOptimizationRequest';
import { formatDateTime } from '../../utils/dateTimeUtils';
import Card from '../Card/Card';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './RequestDetailsCard.css';

interface RequestDetailsCardProps {
    request: IOptimizationRequest;
}

export default function RequestDetailsCard({ request }: RequestDetailsCardProps): ReactElement {
    return (
        <Card title="Optimization Request Details">
            <div className="request-details">
                <div className="request-section">
                    <h4 className="request-section-title">
                        <MaterialIcon icon="settings" />
                        Motor Specifications
                    </h4>
                    <div className="request-specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Power</span>
                            <span className="spec-value">{request.motorSpecs.powerKW} kW</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Axis Height</span>
                            <span className="spec-value">{request.motorSpecs.axisHeightMM} mm</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Current Efficiency</span>
                            <span className="spec-value">{request.motorSpecs.currentEfficiency}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Target Efficiency</span>
                            <span className="spec-value">{request.motorSpecs.targetEfficiency}</span>
                        </div>
                        {request.motorSpecs.malfunctionDescription && (
                            <div className="spec-item spec-item-full">
                                <span className="spec-label">Malfunction</span>
                                <span className="spec-value">{request.motorSpecs.malfunctionDescription}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="request-section">
                    <h4 className="request-section-title">
                        <MaterialIcon icon="event" />
                        Constraints
                    </h4>
                    <div className="request-specs-grid">
                        {request.constraints.maxBudget && (
                            <div className="spec-item">
                                <span className="spec-label">Max Budget</span>
                                <span className="spec-value">€{request.constraints.maxBudget.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="spec-item">
                            <span className="spec-label">Start Time</span>
                            <span className="spec-value">{formatDateTime(request.constraints.timeWindow.startTime)}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">End Time</span>
                            <span className="spec-value">{formatDateTime(request.constraints.timeWindow.endTime)}</span>
                        </div>
                    </div>
                </div>

                <div className="request-section">
                    <h4 className="request-section-title">
                        <MaterialIcon icon="person" />
                        Customer
                    </h4>
                    <div className="request-specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Customer ID</span>
                            <span className="spec-value spec-value-mono">{request.customerId}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
