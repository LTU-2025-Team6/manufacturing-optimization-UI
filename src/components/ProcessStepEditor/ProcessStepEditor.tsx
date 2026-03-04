import { ReactElement, useState, useEffect, useRef, useCallback } from 'react';
import { IEditableProcessStep } from '../../types';
import { useGetAlternativeProviders, useValidateSlot } from '../../hooks/api/strategyEditApi';
import { toLocalDateTimeInput, fromLocalDateTimeInput, formatDateTime } from '../../utils/dateTimeUtils';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Button from '../Button/Button';
import Timeline from '../Timeline/Timeline';
import './ProcessStepEditor.css';

interface ProcessStepEditorProps {
    step: IEditableProcessStep;
    planId: string;
    onUpdate: (stepId: string, updates: Partial<IEditableProcessStep>) => void;
    isSequentialValid: boolean;
    strategyStartTime?: string;
    strategyEndTime?: string;
}

/** Split ISO UTC string into local date "YYYY-MM-DD" and time "HH:mm" */
function splitToLocalParts(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };
    const s = toLocalDateTimeInput(iso); // "YYYY-MM-DDTHH:mm"
    const [date, time] = s.split('T');
    return { date: date ?? '', time: time ?? '' };
}

/** Combine local date "YYYY-MM-DD" and time "HH:mm" back to UTC ISO string */
function combineLocalParts(date: string, time: string): string {
    if (!date || !time) return '';
    return fromLocalDateTimeInput(`${date}T${time}`);
}

const ProcessStepEditor = ({
    step,
    planId,
    onUpdate,
    isSequentialValid,
    strategyStartTime,
    strategyEndTime,
}: ProcessStepEditorProps): ReactElement => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: alternatives, loading: loadingAlternatives, callApi: getAlternatives } = useGetAlternativeProviders();
    const { data: validationResult, loading: validating, callApi: validateSlot } = useValidateSlot();

    // Selected provider id (starts with current)
    const [selectedProviderId, setSelectedProviderId] = useState(step.selectedProviderId);

    // Requested start time (starts with current allocated/proposed)
    const initialStart = step.proposedStartTime || step.allocatedSchedule?.startWorkingTime || '';
    const [requestedStart, setRequestedStart] = useState(initialStart);

    // Split for fine-tune inputs
    const [localDate, setLocalDate] = useState(() => splitToLocalParts(initialStart).date);
    const [localTime, setLocalTime] = useState(() => splitToLocalParts(initialStart).time);

    // Derived: selected alternative data
    const selectedAlt = alternatives?.find(a => a.providerId === selectedProviderId) ?? null;

    // The segments & time range to show on the single timeline
    const displaySegments =
        (validationResult?.allocatedSchedule?.segments?.length
            ? validationResult.allocatedSchedule.segments
            : null) ??
        selectedAlt?.schedule?.segments ??
        step.allocatedSchedule?.segments ??
        [];

    const rangeStart =
        validationResult?.allocatedSchedule?.startWorkingTime ??
        selectedAlt?.schedule?.startWorkingTime ??
        step.allocatedSchedule?.startWorkingTime ??
        strategyStartTime;

    const rangeEnd =
        validationResult?.allocatedSchedule?.endWorkingTime ??
        selectedAlt?.schedule?.endWorkingTime ??
        step.allocatedSchedule?.endWorkingTime ??
        strategyEndTime;

    // ── Fetch window tracking ──────────────────────────────────────────────
    const defaultWindowStart = strategyStartTime || step.allocatedSchedule?.startWorkingTime || new Date().toISOString();
    const defaultWindowEnd   = strategyEndTime   || step.allocatedSchedule?.endWorkingTime   || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Track the window for which alternatives were last fetched
    const fetchedWindowRef = useRef<{ start: string; end: string } | null>(null);

    const doFetchAlternatives = useCallback((windowStart: string, windowEnd: string) => {
        fetchedWindowRef.current = { start: windowStart, end: windowEnd };
        getAlternatives(planId, step.id, {
            scheduleWindowStart: windowStart,
            scheduleWindowEnd: windowEnd,
        });
    }, [planId, step.id, getAlternatives]);

    // ── Auto-fetch alternatives when expanded ──────────────────────────────
    useEffect(() => {
        if (isExpanded && !alternatives && !loadingAlternatives) {
            doFetchAlternatives(defaultWindowStart, defaultWindowEnd);
        }
    }, [isExpanded]); // eslint-disable-line

    // ── Auto-validate whenever provider or time changes ────────────────────
    const validate = useCallback((providerId: string, start: string) => {
        const alt = alternatives?.find(a => a.providerId === providerId);
        if (!alt || !start) return;
        validateSlot(planId, step.id, {
            providerId,
            requestedStart: start,
            durationHours: alt.estimate.duration,
        });
    }, [alternatives, planId, step.id, validateSlot]);

    // ── Auto-validate on initial alternatives load ─────────────────────────
    // Without this, displaySegments switches to the provider's free-schedule
    // (selectedAlt.schedule.segments) and the allocated segment disappears.
    useEffect(() => {
        if (alternatives && alternatives.length > 0 && requestedStart && selectedProviderId) {
            validate(selectedProviderId, requestedStart);
        }
    }, [alternatives]); // eslint-disable-line

    // When provider changes: keep current start time, re-validate
    const handleProviderChange = (providerId: string) => {
        setSelectedProviderId(providerId);
        validate(providerId, requestedStart);
    };

    // Update requestedStart + split inputs + validate (+ re-fetch window if needed)
    const applyNewStart = useCallback((iso: string) => {
        setRequestedStart(iso);
        const { date, time } = splitToLocalParts(iso);
        setLocalDate(date);
        setLocalTime(time);

        // If the new time is outside the currently fetched window, re-fetch alternatives
        // centered on the new date so the timeline shows the right schedule context.
        const newMs = new Date(iso).getTime();
        const win = fetchedWindowRef.current;
        const winStartMs = win ? new Date(win.start).getTime() : null;
        const winEndMs   = win ? new Date(win.end).getTime()   : null;
        const outsideWindow = !win || !winStartMs || !winEndMs
            || newMs < winStartMs || newMs > winEndMs;

        if (outsideWindow) {
            // Build a ±7-day window around the new date
            const newDate = new Date(iso);
            const wStart = new Date(newDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const wEnd   = new Date(newDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            doFetchAlternatives(wStart, wEnd);
            // Validation will be triggered by the useEffect on alternatives change
        } else {
            validate(selectedProviderId, iso);
        }
    }, [selectedProviderId, validate, doFetchAlternatives]);

    // Fine-tune: date field changed
    const handleDateInput = (date: string) => {
        setLocalDate(date);
        const iso = combineLocalParts(date, localTime);
        if (iso) applyNewStart(iso);
    };

    // Fine-tune: time field changed
    const handleTimeInput = (time: string) => {
        setLocalTime(time);
        const iso = combineLocalParts(localDate, time);
        if (iso) applyNewStart(iso);
    };

    // ── Confirm ────────────────────────────────────────────────────────────
    const handleConfirm = () => {
        if (!selectedAlt || !validationResult?.isValid) return;
        onUpdate(step.id, {
            selectedProviderId: selectedAlt.providerId,
            selectedProviderName: selectedAlt.providerName,
            estimate: selectedAlt.estimate,
            proposedStartTime: requestedStart,
            allocatedSchedule: validationResult.allocatedSchedule,
        });
    };

    // ── Reset ──────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSelectedProviderId(step.selectedProviderId);
        setRequestedStart(initialStart);
        const { date, time } = splitToLocalParts(initialStart);
        setLocalDate(date);
        setLocalTime(time);
        onUpdate(step.id, { proposedStartTime: undefined });
    };

    const isModified = step.proposedStartTime !== undefined;
    const hasLocalChanges = selectedProviderId !== step.selectedProviderId || requestedStart !== initialStart;

    const makeDelta = (val: number, base: number, higherIsBetter: boolean) => {
        const diff = val - base;
        if (Math.abs(diff) < 0.001) return null;
        return { diff, better: higherIsBetter ? diff > 0 : diff < 0 };
    };

    return (
        <div className={`process-step-editor ${isModified ? 'modified' : ''} ${!isSequentialValid ? 'invalid' : ''}`}>
            {/* Header */}
            <div className="step-editor-header" onClick={() => setIsExpanded(v => !v)}>
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

                    {/* Provider selector */}
                    <div className="provider-select-row">
                        <label className="provider-select-label">Provider</label>
                        {loadingAlternatives ? (
                            <span className="loading-inline">
                                <MaterialIcon icon="hourglass_empty" /> Loading providers…
                            </span>
                        ) : (
                            <select
                                className="provider-select"
                                value={selectedProviderId}
                                onChange={e => handleProviderChange(e.target.value)}
                            >
                                {alternatives ? (
                                    [...alternatives]
                                        .sort((a, b) =>
                                            a.providerId === step.selectedProviderId ? -1
                                                : b.providerId === step.selectedProviderId ? 1 : 0
                                        )
                                        .map(alt => {
                                            const isCurrentProvider = alt.providerId === step.selectedProviderId;
                                            const costD = makeDelta(alt.estimate.cost, step.estimate.cost, false);
                                            const qualD = makeDelta(alt.estimate.qualityScore, step.estimate.qualityScore, true);
                                            return (
                                                <option key={alt.providerId} value={alt.providerId}>
                                                    {alt.providerName}
                                                    {isCurrentProvider ? ' (current)' : ''}
                                                    {' — '}
                                                    €{alt.estimate.cost.toFixed(2)}
                                                    {costD ? ` (${costD.diff > 0 ? '+' : ''}€${costD.diff.toFixed(2)})` : ''}
                                                    {' · '}
                                                    {(alt.estimate.qualityScore * 100).toFixed(0)}%
                                                    {qualD ? ` (${qualD.diff > 0 ? '+' : ''}${(qualD.diff * 100).toFixed(1)}%)` : ''}
                                                    {' · '}
                                                    {alt.estimate.duration.toFixed(1)}h
                                                </option>
                                            );
                                        })
                                ) : (
                                    <option value={step.selectedProviderId}>{step.selectedProviderName}</option>
                                )}
                            </select>
                        )}
                    </div>

                    {/* Selected provider metrics */}
                    {selectedAlt && selectedAlt.providerId !== step.selectedProviderId && (
                        <div className="provider-diff-row">
                            {[
                                { label: 'Cost', val: `€${selectedAlt.estimate.cost.toFixed(2)}`, delta: makeDelta(selectedAlt.estimate.cost, step.estimate.cost, false) },
                                { label: 'Quality', val: `${(selectedAlt.estimate.qualityScore * 100).toFixed(0)}%`, delta: makeDelta(selectedAlt.estimate.qualityScore, step.estimate.qualityScore, true) },
                                { label: 'CO₂', val: `${selectedAlt.estimate.emissionsKgCO2.toFixed(1)} kg`, delta: makeDelta(selectedAlt.estimate.emissionsKgCO2, step.estimate.emissionsKgCO2, false) },
                                { label: 'Duration', val: `${selectedAlt.estimate.duration.toFixed(1)}h`, delta: null },
                            ].map(({ label, val, delta }) => (
                                <div key={label} className="diff-chip">
                                    <span className="diff-label">{label}</span>
                                    <span className="diff-value">{val}</span>
                                    {delta && (
                                        <span className={`delta ${delta.better ? 'delta-better' : 'delta-worse'}`}>
                                            {delta.diff > 0 ? '+' : ''}{label === 'Quality'
                                                ? `${(delta.diff * 100).toFixed(1)}%`
                                                : label === 'CO₂'
                                                    ? `${delta.diff.toFixed(1)} kg`
                                                    : `€${delta.diff.toFixed(2)}`}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Timeline — clickable to set start time */}
                    {displaySegments.length > 0 && (
                        <div className="timeline-section">
                            <div className="timeline-section-header">
                                <span className="timeline-section-title">
                                    <MaterialIcon icon="calendar_month" />
                                    Schedule
                                    {rangeStart && rangeEnd && (
                                        <span className="timeline-bounds">
                                            {formatDateTime(rangeStart)} → {formatDateTime(rangeEnd)}
                                        </span>
                                    )}
                                </span>
                                <span className="timeline-hint">Click to set start time</span>
                            </div>
                            <div className="timeline-clickable-wrapper">
                                <Timeline
                                    segments={displaySegments}
                                    cursorTime={requestedStart || undefined}
                                    onTrackClick={applyNewStart}
                                />
                            </div>
                        </div>
                    )}

                    {/* Fine-tune time inputs */}
                    <div className="time-finetune-row">
                        <div className="time-finetune-label">
                            <MaterialIcon icon="edit_calendar" />
                            Start time
                        </div>
                        <div className="time-finetune-inputs">
                            <input
                                type="date"
                                className="time-finetune-date"
                                value={localDate}
                                onChange={e => handleDateInput(e.target.value)}
                            />
                            <input
                                type="time"
                                className="time-finetune-time"
                                value={localTime}
                                onChange={e => handleTimeInput(e.target.value)}
                            />
                        </div>
                        {validating && (
                            <span className="validating-indicator">
                                <MaterialIcon icon="hourglass_empty" /> Checking…
                            </span>
                        )}
                    </div>

                    {/* Validation result */}
                    {validationResult && !validating && (
                        <div className={`validation-status ${validationResult.isValid ? 'valid' : 'invalid'}`}>
                            <MaterialIcon icon={validationResult.isValid ? 'check_circle' : 'warning'} />
                            {validationResult.isValid ? (
                                <span>Starts {formatDateTime(requestedStart)} · {selectedAlt?.estimate.duration.toFixed(1) ?? '?'}h</span>
                            ) : (
                                <div className="validation-errors">
                                    <span className="validation-errors-title">Scheduling conflict</span>
                                    {validationResult.errors && validationResult.errors.length > 0 && (
                                        <ul className="validation-errors-list">
                                            {validationResult.errors.map((e, i) => (
                                                <li key={i}>{e}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Confirm + Reset */}
                    {(validationResult?.isValid || isModified || hasLocalChanges) && (
                        <div className="step-editor-actions">
                            {validationResult?.isValid && selectedAlt && (
                                <Button variant="primary" onClick={handleConfirm}>
                                    <MaterialIcon icon="check" />
                                    Confirm
                                </Button>
                            )}
                            {(isModified || hasLocalChanges) && (
                                <Button variant="secondary" onClick={handleReset}>
                                    <MaterialIcon icon="undo" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProcessStepEditor;
