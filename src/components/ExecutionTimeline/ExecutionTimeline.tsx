import React from 'react';
import { IProcessStep } from '../../types/IProcessStep';
import { formatDateTime } from '../../utils/dateTimeUtils';
import { formatDuration } from '../../utils/durationParser';
import './ExecutionTimeline.css';

interface ExecutionTimelineProps {
    steps: IProcessStep[];
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ steps }) => {
    if (!steps || steps.length === 0) {
        return <p className="text-muted">No timeline data available.</p>;
    }

    const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

    return (
        <div className="timeline-execution-container">
            {sortedSteps.map((step, index) => {
                let statusClass = 'pending';
                let statusIcon = '⏳';
                
                if (step.executionStatus === 'InProgress') {
                    statusClass = 'in-progress';
                    statusIcon = '🔄'; 
                } else if (step.executionStatus === 'Completed') {
                    statusClass = 'completed';
                    statusIcon = '✅';
                } else if (step.executionStatus === 'Failed') {
                    statusClass = 'failed';
                    statusIcon = '❌';
                }

                return (
                    <div key={step.id} className={`timeline-execution-item ${statusClass}`}>
                        <div className="timeline-execution-marker">
                            <div className="step-number-circle">
                                {statusIcon === '🔄' ? <div className="spinner-mini"></div> : step.stepNumber}
                            </div>
                            {index < sortedSteps.length - 1 && <div className="timeline-execution-line"></div>}
                        </div>
                        
                        <div className="timeline-execution-content">
                            <div className="step-header-card">
                                <h3>Step {step.stepNumber}: {step.process}</h3>
                                <span className={`status-badge ${statusClass}`}>
                                    {statusIcon} {step.executionStatus || 'Pending'}
                                </span>
                            </div>
                            
                            <div className="step-details-card">
                                <p><strong>Provider:</strong> {step.selectedProviderName}</p>
                                
                                {step.allocatedSlot ? (
                                    <p><strong>Scheduled:</strong> {formatDateTime(step.allocatedSlot.startTime)} - {formatDateTime(step.allocatedSlot.endTime)}</p>
                                ) : (
                                    <p className="text-muted">Not scheduled yet</p>
                                )}
                                
                                <div className="estimate-summary">
                                    <span className="estimate-badge">💵 ${step.estimate.cost.toFixed(2)}</span>
                                    <span className="estimate-badge">⏱️ {formatDuration(step.estimate.duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};