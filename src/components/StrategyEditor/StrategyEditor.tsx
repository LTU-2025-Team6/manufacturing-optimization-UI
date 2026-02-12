import { ReactElement, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IOptimizationStrategy } from '../../types/IOptimizationStrategy';
import { IEditableStrategy, IEditableProcessStep, IUpdateStrategyRequest } from '../../types/IEditableStrategy';
import { useUpdateStrategy } from '../../hooks/api/strategyEditApi';
import { formatDateTime } from '../../utils/dateTimeUtils';
import ProcessStepEditor from '../ProcessStepEditor/ProcessStepEditor';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Timeline from '../Timeline/Timeline';
import { IProviderScheduleSegment } from '../../types/IProviderSchedule';
import './StrategyEditor.css';

interface StrategyEditorProps {
    strategy: IOptimizationStrategy;
    requestId: string;
    onSave?: (updatedStrategy: IOptimizationStrategy) => void;
    onCancel?: () => void;
}

const StrategyEditor = ({ strategy, requestId, onSave, onCancel }: StrategyEditorProps): ReactElement => {
    const navigate = useNavigate();

    console.log(strategy);
    
    // Convert strategy to editable format
    const [editableStrategy, setEditableStrategy] = useState<IEditableStrategy>(() => ({
        ...strategy,
        steps: strategy.steps.map(step => ({
            ...step,
            proposedStartTime: undefined,
            proposedEndTime: undefined
        })),
        isModified: false,
        originalStrategyId: strategy.id
    }));

    const { data: updateResult, loading: saving, error: saveError, callApi: updateStrategy } = useUpdateStrategy();

    // Track modifications
    const modifications = useMemo(() => {
        return editableStrategy.steps
            .filter(step => step.proposedStartTime || step.proposedEndTime)
            .map(step => {
                const originalStep = strategy.steps.find(s => s.id === step.id);
                const providerChanged = originalStep && step.selectedProviderId !== originalStep.selectedProviderId;
                
                return {
                    stepId: step.id,
                    stepNumber: step.stepNumber,
                    newProviderId: providerChanged ? step.selectedProviderId : undefined,
                    newStartTime: step.proposedStartTime || step.allocatedSchedule?.startWorkingTime,
                    newEndTime: step.proposedEndTime || step.allocatedSchedule?.endWorkingTime
                };
            });
    }, [editableStrategy.steps, strategy.steps]);

    const hasModifications = modifications.length > 0;

    // Handle step update
    const handleStepUpdate = (stepId: string, updates: Partial<IEditableProcessStep>) => {
        setEditableStrategy(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
                step.id === stepId ? { ...step, ...updates } : step
            ),
            isModified: true
        }));
    };



    // Calculate overall strategy time range
    const strategyTimeRange = useMemo(() => {
        const stepsWithSchedule = editableStrategy.steps
            .filter(step => step.allocatedSchedule?.startWorkingTime && step.allocatedSchedule?.endWorkingTime);

        if (stepsWithSchedule.length === 0) {
            // Default to now + 7 days if no schedules exist
            return {
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
        }

        const startTimes = stepsWithSchedule.map(s => new Date(s.allocatedSchedule!.startWorkingTime).getTime());
        const endTimes = stepsWithSchedule.map(s => new Date(s.allocatedSchedule!.endWorkingTime).getTime());

        return {
            startTime: new Date(Math.min(...startTimes)).toISOString(),
            endTime: new Date(Math.max(...endTimes)).toISOString()
        };
    }, [editableStrategy.steps]);

    // Check if steps are sequential
    const checkSequentialValidity = (step: IEditableProcessStep): boolean => {
        const stepIndex = editableStrategy.steps.findIndex(s => s.id === step.id);
        if (stepIndex === 0) return true; // First step is always valid

        const previousStep = editableStrategy.steps[stepIndex - 1];
        const currentStartTime = step.proposedStartTime || step.allocatedSchedule?.startWorkingTime;
        const previousEndTime = previousStep.proposedEndTime || previousStep.allocatedSchedule?.endWorkingTime;

        if (!currentStartTime || !previousEndTime) return true; // Can't validate without times

        return new Date(currentStartTime).getTime() >= new Date(previousEndTime).getTime();
    };

    // Save changes
    const handleSave = async () => {
        if (modifications.length === 0) {
            alert('No modifications to save');
            return;
        }

        // Prepare update request
        const updateRequest: IUpdateStrategyRequest = {
            strategyId: strategy.id,
            updates: modifications
        };

        // Call API
        updateStrategy(strategy.id, updateRequest);
    };

    // Handle update result
    useEffect(() => {
        if (updateResult) {
            if (updateResult.validationErrors && updateResult.validationErrors.length > 0) {
                // Show validation errors if any
                alert('Validation errors: ' + updateResult.validationErrors.join(', '));
            } else {
                // Success
                if (onSave && updateResult.updatedStrategy) {
                    onSave(updateResult.updatedStrategy);
                } else {
                    // Navigate back to plan view
                    navigate(`/plan/${requestId}`);
                }
            }
        }
    }, [updateResult, onSave, navigate, requestId]);

    // Reset changes
    const handleReset = () => {
        if (confirm('Are you sure you want to reset all changes?')) {
            setEditableStrategy({
                ...strategy,
                steps: strategy.steps.map(step => ({
                    ...step,
                    proposedStartTime: undefined,
                    proposedEndTime: undefined
                })),
                isModified: false,
                originalStrategyId: strategy.id
            });
        }
    };

    // Generate combined timeline segments with conflict detection
    const { timelineSegments, hasConflicts, conflictDetails } = useMemo(() => {
        const segments: IProviderScheduleSegment[] = [];
        const conflicts: { 
            stepNumber: number; 
            stepName: string; 
            conflictsWith: Array<{ 
                stepNumber: number; 
                stepName: string; 
                overlapStart: string; 
                overlapEnd: string;
                conflictType: 'overlap' | 'sequencing';
            }> 
        }[] = [];

        // Collect all steps with schedules
        const stepsWithSchedule = editableStrategy.steps
            .filter(step => step.allocatedSchedule?.startWorkingTime && step.allocatedSchedule?.endWorkingTime)
            .sort((a, b) => a.stepNumber - b.stepNumber);

        // Check for overlaps and sequencing issues
        for (let i = 0; i < stepsWithSchedule.length; i++) {
            const currentStep = stepsWithSchedule[i];
            const currentStart = new Date(currentStep.allocatedSchedule!.startWorkingTime).getTime();
            const currentEnd = new Date(currentStep.allocatedSchedule!.endWorkingTime).getTime();
            
            const conflictsList: Array<{ 
                stepNumber: number; 
                stepName: string; 
                overlapStart: string; 
                overlapEnd: string;
                conflictType: 'overlap' | 'sequencing';
            }> = [];
            
            // Check against previous step for sequencing
            if (i > 0) {
                const prevStep = stepsWithSchedule[i - 1];
                const prevEnd = new Date(prevStep.allocatedSchedule!.endWorkingTime).getTime();
                
                // Sequencing violation: current step starts before previous step ends
                if (currentStart < prevEnd) {
                    const overlapStart = currentStart;
                    const overlapEnd = Math.min(currentEnd, prevEnd);
                    
                    conflictsList.push({
                        stepNumber: prevStep.stepNumber,
                        stepName: prevStep.process,
                        overlapStart: new Date(overlapStart).toISOString(),
                        overlapEnd: new Date(overlapEnd).toISOString(),
                        conflictType: 'sequencing'
                    });
                }
            }
            
            // Check against all other steps for time overlaps
            for (let j = 0; j < stepsWithSchedule.length; j++) {
                if (i === j) continue;
                
                const otherStep = stepsWithSchedule[j];
                const otherStart = new Date(otherStep.allocatedSchedule!.startWorkingTime).getTime();
                const otherEnd = new Date(otherStep.allocatedSchedule!.endWorkingTime).getTime();
                
                // Check if times overlap (and it's not the previous step we already checked)
                if (currentStart < otherEnd && currentEnd > otherStart) {
                    // Skip if it's the previous step and we already added it as sequencing conflict
                    if (j === i - 1 && conflictsList.some(c => c.stepNumber === otherStep.stepNumber)) {
                        continue;
                    }
                    
                    const overlapStart = Math.max(currentStart, otherStart);
                    const overlapEnd = Math.min(currentEnd, otherEnd);
                    
                    conflictsList.push({
                        stepNumber: otherStep.stepNumber,
                        stepName: otherStep.process,
                        overlapStart: new Date(overlapStart).toISOString(),
                        overlapEnd: new Date(overlapEnd).toISOString(),
                        conflictType: 'overlap'
                    });
                }
            }
            
            // Add segment for this step
            const segmentType = conflictsList.length > 0 
                ? `Conflict-Step${currentStep.stepNumber}` 
                : `WorkingTime-Step${currentStep.stepNumber}`;
            
            segments.push({
                startTime: currentStep.allocatedSchedule!.startWorkingTime,
                endTime: currentStep.allocatedSchedule!.endWorkingTime,
                segmentType
            });
            
            if (conflictsList.length > 0) {
                conflicts.push({
                    stepNumber: currentStep.stepNumber,
                    stepName: currentStep.process,
                    conflictsWith: conflictsList
                });
            }
        }

        // Sort segments by start time for predictable rendering (later segments overlay earlier ones)
        const sortedSegments = segments.sort((a, b) => {
            const timeA = new Date(a.startTime).getTime();
            const timeB = new Date(b.startTime).getTime();
            return timeA - timeB;
        });

        return {
            timelineSegments: sortedSegments,
            hasConflicts: conflicts.length > 0,
            conflictDetails: conflicts
        };
    }, [editableStrategy.steps]);

    // Calculate updated metrics (mock - in reality, backend will do this)
    const updatedMetrics = useMemo(() => {
        const totalCost = editableStrategy.steps.reduce((sum, step) => sum + step.estimate.cost, 0);
        const avgQuality = editableStrategy.steps.reduce((sum, step) => sum + step.estimate.qualityScore, 0) / editableStrategy.steps.length;
        const totalEmissions = editableStrategy.steps.reduce((sum, step) => sum + step.estimate.emissionsKgCO2, 0);

        // Helper: calculate total time from first step start to last step end
        const calculateTotalTime = (steps: IEditableProcessStep[]): number => {
            const stepsWithSchedule = steps.filter(s => s.allocatedSchedule?.startWorkingTime && s.allocatedSchedule?.endWorkingTime);
            if (stepsWithSchedule.length === 0) return 0;
            
            const times = stepsWithSchedule.map(s => ({
                start: new Date(s.allocatedSchedule!.startWorkingTime).getTime(),
                end: new Date(s.allocatedSchedule!.endWorkingTime).getTime()
            }));
            
            const firstStepStart = Math.min(...times.map(t => t.start));
            const lastStepEnd = Math.max(...times.map(t => t.end));
            
            return (lastStepEnd - firstStepStart) / (1000 * 60 * 60); // hours
        };

        const originalTotalTime = calculateTotalTime(strategy.steps);
        const currentTotalTime = calculateTotalTime(editableStrategy.steps);

        return {
            totalCost,
            avgQuality,
            totalEmissions,
            currentTotalTime,
            originalTotalTime,
            costDiff: totalCost - strategy.metrics.totalCost,
            qualityDiff: avgQuality - strategy.metrics.averageQuality,
            emissionsDiff: totalEmissions - strategy.metrics.totalEmissionsKgCO2,
            timeDiff: currentTotalTime - originalTotalTime
        };
    }, [editableStrategy.steps, strategy.metrics, strategy.steps]);

    return (
        <div className="strategy-editor">
            {/* Header */}
            <div className="editor-header">
                <div className="editor-title-section">
                    <h2>
                        <MaterialIcon icon="edit" />
                        Edit Strategy: {strategy.strategyName}
                    </h2>
                    <p className="editor-subtitle">
                        Manually adjust provider selections and scheduling for each process step
                    </p>
                </div>

                {hasModifications && (
                    <div className="modifications-badge">
                        <MaterialIcon icon="info" />
                        {modifications.length} modification{modifications.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Metrics Comparison */}
            {hasModifications && (
                <div className="metrics-comparison">
                    <h3>Impact Preview</h3>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <span className="metric-label">Total Cost</span>
                            <span className="metric-value">€{updatedMetrics.totalCost.toFixed(2)}</span>
                            <span className={`metric-diff ${updatedMetrics.costDiff >= 0 ? 'negative' : 'positive'}`}>
                                {updatedMetrics.costDiff >= 0 ? '+' : ''}€{updatedMetrics.costDiff.toFixed(2)}
                            </span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Avg Quality</span>
                            <span className="metric-value">{(updatedMetrics.avgQuality * 100).toFixed(1)}%</span>
                            <span className={`metric-diff ${updatedMetrics.qualityDiff >= 0 ? 'positive' : 'negative'}`}>
                                {updatedMetrics.qualityDiff >= 0 ? '+' : ''}{(updatedMetrics.qualityDiff * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Total CO₂</span>
                            <span className="metric-value">{updatedMetrics.totalEmissions.toFixed(1)} kg</span>
                            <span className={`metric-diff ${updatedMetrics.emissionsDiff >= 0 ? 'negative' : 'positive'}`}>
                                {updatedMetrics.emissionsDiff >= 0 ? '+' : ''}{updatedMetrics.emissionsDiff.toFixed(1)} kg
                            </span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Total Time</span>
                            <span className="metric-value">{updatedMetrics.currentTotalTime.toFixed(1)} h</span>
                            <span className={`metric-diff ${updatedMetrics.timeDiff >= 0 ? 'negative' : 'positive'}`}>
                                {updatedMetrics.timeDiff >= 0 ? '+' : ''}{updatedMetrics.timeDiff.toFixed(1)} h
                            </span>
                        </div>
                    </div>
                </div>
            )}



            {/* Save Error */}
            {saveError && (
                <Alert variant="error" title={saveError.title || 'Save Failed'}>
                    {saveError.detail && <p>{saveError.detail}</p>}
                    {saveError.status && <p>Status code: {saveError.status}</p>}
                </Alert>
            )}

            {/* Combined Timeline */}
            {timelineSegments.length > 0 && (
                <div className="combined-timeline-section">
                    <h3>
                        <MaterialIcon icon="timeline" />
                        Overall Schedule Timeline
                        {hasConflicts && (
                            <span className="conflict-badge">
                                <MaterialIcon icon="warning" />
                                Conflicts Detected
                            </span>
                        )}
                    </h3>
                    <p className="section-description">
                        {hasConflicts 
                            ? 'Red segments indicate scheduling conflicts. Steps must be executed sequentially without time overlaps.'
                            : 'All steps are scheduled sequentially without conflicts.'}
                    </p>
                    
                    {hasConflicts && conflictDetails.length > 0 && (
                        <Alert variant="error" title="Scheduling Conflicts Detected">
                            <p>The following issues were found:</p>
                            <ul className="conflict-details-list">
                                {conflictDetails.map((conflict) => (
                                    <li key={conflict.stepNumber}>
                                        <strong>Step {conflict.stepNumber} ({conflict.stepName})</strong>
                                        <ul>
                                            {conflict.conflictsWith.map((other, idx) => {
                                                if (other.conflictType === 'sequencing') {
                                                    return (
                                                        <li key={idx} className="sequencing-conflict">
                                                            <MaterialIcon icon="arrow_forward" />
                                                            <strong>Sequencing Issue:</strong> Step {conflict.stepNumber} starts before Step {other.stepNumber} ({other.stepName}) ends
                                                            <br />
                                                            <span className="overlap-time">
                                                                Step {conflict.stepNumber} should start after {formatDateTime(other.overlapEnd)}
                                                            </span>
                                                        </li>
                                                    );
                                                } else {
                                                    return (
                                                        <li key={idx} className="overlap-conflict">
                                                            <MaterialIcon icon="event_busy" />
                                                            <strong>Time Overlap:</strong> with Step {other.stepNumber} ({other.stepName})
                                                            <br />
                                                            <span className="overlap-time">
                                                                Overlap period: {formatDateTime(other.overlapStart)} - {formatDateTime(other.overlapEnd)}
                                                            </span>
                                                        </li>
                                                    );
                                                }
                                            })}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </Alert>
                    )}
                    
                    <div className="timeline-wrapper">
                        <Timeline segments={timelineSegments} showTimeLabels={true} />
                    </div>
                </div>
            )}

            {/* Process Steps */}
            <div className="steps-editor-section">
                <h3>Process Steps ({editableStrategy.steps.length})</h3>
                <p className="section-description">
                    Edit each step individually. Steps are executed in sequential order.
                </p>

                <div className="steps-list">
                    {editableStrategy.steps
                        .sort((a, b) => a.stepNumber - b.stepNumber)
                        .map(step => (
                            <ProcessStepEditor
                                key={step.id}
                                step={step}
                                strategyId={strategy.id}
                                onUpdate={handleStepUpdate}
                                isSequentialValid={checkSequentialValidity(step)}
                                strategyStartTime={strategyTimeRange.startTime}
                                strategyEndTime={strategyTimeRange.endTime}
                            />
                        ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="editor-actions">
                <div className="actions-left">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        disabled={!hasModifications}
                    >
                        <MaterialIcon icon="restart_alt" />
                        Reset All Changes
                    </Button>
                </div>

                <div className="actions-right">
                    <Button
                        variant="secondary"
                        onClick={onCancel || (() => navigate(`/plan/${requestId}`))}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!hasModifications || saving}
                    >
                        <MaterialIcon icon="save" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StrategyEditor;
