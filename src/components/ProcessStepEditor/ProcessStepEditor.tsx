import { ReactElement, useState } from 'react';
import { IEditableProcessStep, IAlternativeProvider } from '../../types/IEditableStrategy';
import { useGetAlternativeProviders, useValidateProcessTime } from '../../hooks/api/strategyEditApi';
import { toLocalDateTimeInput, fromLocalDateTimeInput, formatDateTime } from '../../utils/dateTimeUtils';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Button from '../Button/Button';
import Timeline from '../Timeline/Timeline';
import './ProcessStepEditor.css';

interface ProcessStepEditorProps {
    step: IEditableProcessStep;
    strategyId: string;
    onUpdate: (stepId: string, updates: Partial<IEditableProcessStep>) => void;
    isSequentialValid: boolean;
    strategyStartTime?: string;
    strategyEndTime?: string;
}

const ProcessStepEditor = ({ 
    step, 
    strategyId, 
    onUpdate,
    isSequentialValid,
    strategyStartTime,
    strategyEndTime
}: ProcessStepEditorProps): ReactElement => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAlternatives, setShowAlternatives] = useState(false);
    const { data: alternatives, loading: loadingAlternatives, callApi: getAlternatives } = useGetAlternativeProviders();
    const { data: validationResult, loading: validating, callApi: validateTime } = useValidateProcessTime();

    // State for selected alternative and requested time
    const [selectedAlternative, setSelectedAlternative] = useState<IAlternativeProvider | null>(null);
    const [requestedStartTime, setRequestedStartTime] = useState<string>('');

    // Local state for schedule range time inputs - use strategy range as default
    const [scheduleStartTime, setScheduleStartTime] = useState(
        strategyStartTime || step.proposedStartTime || step.allocatedSchedule?.startWorkingTime || 
        new Date().toISOString()
    );
    const [scheduleEndTime, setScheduleEndTime] = useState(
        strategyEndTime || step.proposedEndTime || step.allocatedSchedule?.endWorkingTime || 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    );

    const handleLoadAlternatives = async () => {
        await getAlternatives(strategyId, step.id, {
            scheduleStartTime,
            scheduleEndTime
        });

        setShowAlternatives(true);
        setSelectedAlternative(null);
        setRequestedStartTime('');
    };

    const handleSelectTimeForAlternative = async (alternative: IAlternativeProvider, startTime: string) => {
        setSelectedAlternative(alternative);
        setRequestedStartTime(startTime);
        // Validate the selected time
        await validateTime(strategyId, step.id, {
            providerId: alternative.providerId,
            processType: step.process,
            requestedStartTime: startTime,
            estimatedDuration: alternative.estimate.duration
        });
    };

    const handleConfirmAlternative = () => {
        if (!selectedAlternative || !validationResult?.isValid) return;

        onUpdate(step.id, {
            selectedProviderId: selectedAlternative.providerId,
            selectedProviderName: selectedAlternative.providerName,
            estimate: {
                ...selectedAlternative.estimate,
                id: step.estimate.id
            },
            proposedStartTime: requestedStartTime,
            allocatedSchedule: validationResult.validatedSchedule
        });
        setShowAlternatives(false);
        setSelectedAlternative(null);
        setRequestedStartTime('');
    };

    const isModified = step.proposedStartTime !== undefined || 
                      step.proposedEndTime !== undefined;

    return (
        <div className={`process-step-editor ${isModified ? 'modified' : ''} ${!isSequentialValid ? 'invalid' : ''}`}>
            <div className="step-editor-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="step-number">
                    <MaterialIcon icon="inventory_2" />
                    <span>Step {step.stepNumber}</span>
                </div>
                <div className="step-process-name">{step.process}</div>
                <div className="step-provider-badge">{step.selectedProviderName}</div>
                {isModified && <span className="modified-indicator">Modified</span>}
                {!isSequentialValid && <span className="error-indicator">⚠ Timing conflict</span>}
                <MaterialIcon icon={isExpanded ? 'expand_less' : 'expand_more'} />
            </div>

            {isExpanded && (
                <div className="step-editor-body">
                    {/* Current Details */}
                    <div className="step-details-section">
                        <h4>Current Configuration</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Provider:</span>
                                <span className="detail-value">{step.selectedProviderName}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Cost:</span>
                                <span className="detail-value">€{step.estimate.cost.toFixed(2)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Quality:</span>
                                <span className="detail-value">{(step.estimate.qualityScore * 100).toFixed(0)}%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">CO₂:</span>
                                <span className="detail-value">{step.estimate.emissionsKgCO2.toFixed(1)} kg</span>
                            </div>
                        </div>
                    </div>

                    {/* Current Process Timeline */}
                    <div className="current-timeline-section">
                        <h4>
                            <MaterialIcon icon="calendar_month" />
                            Current Schedule
                        </h4>
                        {step.allocatedSchedule && step.allocatedSchedule.segments && step.allocatedSchedule.segments.length > 0 ? (
                            <>
                                <div className="timeline-info">
                                    <span className="timeline-range">
                                        {formatDateTime(step.allocatedSchedule.startWorkingTime)} - {formatDateTime(step.allocatedSchedule.endWorkingTime)}
                                    </span>
                                    {isModified && <span className="modified-badge">Modified</span>}
                                </div>
                                <div className="timeline-container">
                                    <Timeline 
                                        segments={step.allocatedSchedule.segments}
                                        timeRange={strategyStartTime && strategyEndTime ? {
                                            start: strategyStartTime,
                                            end: strategyEndTime
                                        } : undefined}
                                    />
                                </div>
                            </>
                        ) : (
                            <p className="no-timeline">No schedule allocated yet</p>
                        )}
                    </div>

                    {/* Schedule Range Selection */}
                    <div className="schedule-range-section">
                        <h4>View Alternative Schedules</h4>
                        <div className="schedule-range-inputs">
                            <div className="range-input-compact">
                                <label>From:</label>
                                <input
                                    type="datetime-local"
                                    value={toLocalDateTimeInput(scheduleStartTime)}
                                    onChange={(e) => setScheduleStartTime(fromLocalDateTimeInput(e.target.value))}
                                />
                            </div>
                            <div className="range-input-compact">
                                <label>To:</label>
                                <input
                                    type="datetime-local"
                                    value={toLocalDateTimeInput(scheduleEndTime)}
                                    onChange={(e) => setScheduleEndTime(fromLocalDateTimeInput(e.target.value))}
                                />
                            </div>
                            <Button
                                variant="secondary"
                                onClick={handleLoadAlternatives}
                                disabled={loadingAlternatives}
                            >
                                <MaterialIcon icon="search" />
                                {loadingAlternatives ? 'Loading...' : 'Search'}
                            </Button>
                        </div>
                    </div>

                    {/* Provider Selection */}
                    {showAlternatives && (
                    <div className="provider-selection-section">
                        <h4>Alternative Providers</h4>

                        {loadingAlternatives && (
                            <div className="alternatives-loading">
                                <MaterialIcon icon="hourglass_empty" />
                                <span>Loading alternative providers...</span>
                            </div>
                        )}

                        {showAlternatives && !loadingAlternatives && alternatives && alternatives.length > 0 && (
                            <div className="alternatives-list">
                                <h5>Available Alternatives</h5>
                                {[...alternatives]
                                    .sort((a, b) => {
                                        // Sort current provider first
                                        const aIsCurrent = a.providerId === step.selectedProviderId;
                                        const bIsCurrent = b.providerId === step.selectedProviderId;
                                        if (aIsCurrent && !bIsCurrent) return -1;
                                        if (!aIsCurrent && bIsCurrent) return 1;
                                        return 0;
                                    })
                                    .map((alt) => {
                                    const isCurrentProvider = alt.providerId === step.selectedProviderId;
                                    return (
                                    <div 
                                        key={alt.providerId} 
                                        className={`alternative-card ${selectedAlternative?.providerId === alt.providerId ? 'selected' : ''} ${isCurrentProvider ? 'current-provider' : ''}`}
                                    >
                                        <div className="alternative-header">
                                            <strong>{alt.providerName}</strong>
                                            {isCurrentProvider && (
                                                <span className="current-badge">
                                                    <MaterialIcon icon="check_circle" />
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="alternative-metrics">
                                            <span>Cost: €{alt.estimate.cost.toFixed(2)}</span>
                                            <span>Quality: {(alt.estimate.qualityScore * 100).toFixed(0)}%</span>
                                            <span>CO₂: {alt.estimate.emissionsKgCO2.toFixed(1)} kg</span>
                                            <span>Duration: {alt.estimate.duration.toFixed(1)}h</span>
                                        </div>
                                        
                                        {alt.schedule && alt.schedule.segments && alt.schedule.segments.length > 0 && (
                                            <div className="alternative-schedule">
                                                <div className="schedule-header">
                                                    <span className="schedule-label">
                                                        <MaterialIcon icon="schedule" />
                                                        Available Schedule
                                                    </span>
                                                    <span className="schedule-time-range">
                                                        {formatDateTime(alt.schedule.startWorkingTime)} - {formatDateTime(alt.schedule.endWorkingTime)}
                                                    </span>
                                                </div>
                                                
                                                {selectedAlternative?.providerId === alt.providerId && validationResult && (
                                                    <div className={`validation-status ${validationResult.isValid ? 'valid' : 'invalid'}`}>
                                                        {validationResult.isValid ? (
                                                            <>
                                                                <MaterialIcon icon="check_circle" />
                                                                <span>Process can be scheduled at {formatDateTime(requestedStartTime)}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <MaterialIcon icon="error" />
                                                                <span>{validationResult.errors?.join(', ')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div className="alternative-timeline">
                                                    <Timeline 
                                                        segments={selectedAlternative?.providerId === alt.providerId && validationResult?.validatedSchedule
                                                                ? validationResult.validatedSchedule.segments
                                                                : alt.schedule.segments}
                                                        timeRange={scheduleStartTime && scheduleEndTime ? {
                                                            start: scheduleStartTime,
                                                            end: scheduleEndTime
                                                        } : undefined}
                                                    />
                                                </div>

                                                <div className="time-selection">
                                                    <label>Select Process Start Time:</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={selectedAlternative?.providerId === alt.providerId && requestedStartTime 
                                                            ? toLocalDateTimeInput(requestedStartTime)
                                                            : ''}
                                                        onChange={(e) => handleSelectTimeForAlternative(alt, fromLocalDateTimeInput(e.target.value))}
                                                        min={toLocalDateTimeInput(scheduleStartTime)}
                                                        max={toLocalDateTimeInput(scheduleEndTime)}
                                                    />
                                                    {validating && selectedAlternative?.providerId === alt.providerId && (
                                                        <span className="validating-indicator">
                                                            <MaterialIcon icon="hourglass_empty" />
                                                            Validating...
                                                        </span>
                                                    )}
                                                </div>

                                                {selectedAlternative?.providerId === alt.providerId && validationResult?.isValid && (
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleConfirmAlternative}
                                                        disabled={!validationResult.isValid}
                                                    >
                                                        <MaterialIcon icon="check" />
                                                        Confirm Selection
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        )}

                        {!loadingAlternatives && alternatives && alternatives.length === 0 && (
                            <div className="no-alternatives">
                                No alternative providers available for this process
                            </div>
                        )}
                    </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProcessStepEditor;
