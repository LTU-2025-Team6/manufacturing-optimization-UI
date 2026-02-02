import { IProcessStep } from '../../types/IProcessStep';
import React from 'react';
import './Timeline.css';

interface TimelineProps {
    steps: IProcessStep[];
}

type SegmentType = 'FreeSpace' | 'Break' | 'Occupied' | 'WorkingTime';

const getSegmentClassName = (segmentType: string): string => {
    const type = segmentType.toLowerCase();
    
    if (type.includes('freespace') || type === 'freespace') {
        return 'timeline-bar-freespace';
    } else if (type.includes('break') || type === 'break') {
        return 'timeline-bar-break';
    } else if (type.includes('occupied') || type === 'occupied') {
        return 'timeline-bar-occupied';
    } else if (type.includes('workingtime') || type === 'workingtime') {
        return 'timeline-bar-workingtime';
    }
    
    // Default for unknown types
    return 'timeline-bar-process';
};

const getSegmentLabel = (segmentType: string, duration: number): string => {
    const type = segmentType.toLowerCase();
    
    return `${duration.toFixed(1)}h`;
};

export default function Timeline({ steps }: TimelineProps) {
    const hasTimeline = steps.some(s => s.allocatedSchedule);

    if (!hasTimeline) {
        return <p className="text-muted">No timeline data available (time window was not specified)</p>;
    }

    const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

    // Calculate timeline boundaries
    const allSlots = sortedSteps.map(s => s.allocatedSchedule).filter(Boolean);
    if (allSlots.length === 0) return null;

    const startTimes = allSlots.map(s => new Date(s!.startTime).getTime());
    const endTimes = allSlots.map(s => new Date(s!.endTime).getTime());
    const minTime = Math.min(...startTimes);
    const maxTime = Math.max(...endTimes);
    const totalDuration = maxTime - minTime;

    const formatDateTime = (date: Date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPosition = (time: number) => {
        return ((time - minTime) / totalDuration) * 100;
    };

    return (
        <div className="timeline">
            <div className="timeline-header">
                <span>{formatDateTime(new Date(minTime))}</span>
                <span>{formatDateTime(new Date(maxTime))}</span>
            </div>

            {/* Combined timeline showing all processes */}
            <div className="timeline-combined">
                <div className="timeline-label-combined">
                    <strong>Full Schedule</strong>
                    <span>All Steps</span>
                </div>
                <div className="timeline-track">
                    {sortedSteps.map(step => {
                        if (!step.allocatedSchedule) return null;
                        
                        // Find all WorkingTime segments for this step
                        const workingSegments = step.allocatedSchedule.segments?.filter(segment => {
                            const type = segment.segmentType.toLowerCase();
                            return type.includes('workingtime');
                        }) || [];

                        if (workingSegments.length === 0) {
                            // Fallback: use full schedule time
                            const start = new Date(step.allocatedSchedule.startTime).getTime();
                            const end = new Date(step.allocatedSchedule.endTime).getTime();
                            const duration = (end - start) / (1000 * 60 * 60);
                            const leftPos = getPosition(start);
                            const width = getPosition(end) - leftPos;

                            return (
                                <div
                                    key={step.id}
                                    className="timeline-bar timeline-bar-process"
                                    style={{
                                        left: `${leftPos}%`,
                                        width: `${width}%`
                                    }}
                                    title={`Step ${step.stepNumber}: ${step.process}\n${formatDateTime(new Date(start))} - ${formatDateTime(new Date(end))}\n${duration.toFixed(1)}h`}
                                >
                                    <span className="timeline-bar-text">{step.stepNumber}</span>
                                </div>
                            );
                        }

                        // Find min startTime and max endTime among WorkingTime segments
                        const segmentStartTimes = workingSegments.map(s => new Date(s.startTime).getTime());
                        const segmentEndTimes = workingSegments.map(s => new Date(s.endTime).getTime());
                        const minStart = Math.min(...segmentStartTimes);
                        const maxEnd = Math.max(...segmentEndTimes);
                        const duration = (maxEnd - minStart) / (1000 * 60 * 60);
                        const leftPos = getPosition(minStart);
                        const width = getPosition(maxEnd) - leftPos;

                        return (
                            <div
                                key={step.id}
                                className="timeline-bar timeline-bar-process"
                                style={{
                                    left: `${leftPos}%`,
                                    width: `${width}%`
                                }}
                                title={`Step ${step.stepNumber}: ${step.process}\n${formatDateTime(new Date(minStart))} - ${formatDateTime(new Date(maxEnd))}\n${duration.toFixed(1)}h (${workingSegments.length} segment${workingSegments.length > 1 ? 's' : ''})`}
                            >
                                <span className="timeline-bar-text">{step.stepNumber}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Individual steps timeline */}
            <div className="timeline-container">
                {sortedSteps.map((step) => {
                    if (!step.allocatedSchedule) return null;

                    const start = new Date(step.allocatedSchedule.startTime).getTime();
                    const end = new Date(step.allocatedSchedule.endTime).getTime();
                    const duration = (end - start) / (1000 * 60 * 60); // hours

                    return (
                        <div key={step.id} className="timeline-row">
                            <div className="timeline-label">
                                <strong>Step {step.stepNumber}</strong>
                                <span>{step.process}</span>
                                <small>{step.selectedProviderName}</small>
                            </div>
                            <div className="timeline-track">
                                {step.allocatedSchedule.segments && step.allocatedSchedule.segments.length > 0 ? (
                                    // Show WorkingTime, Break, and Occupied segments
                                    step.allocatedSchedule.segments
                                        .filter(segment => {
                                            const type = segment.segmentType.toLowerCase();
                                            // Show WorkingTime, Break, and Occupied segments
                                            return type.includes('workingtime') || type.includes('break') || type.includes('occupied');
                                        })
                                        .map((segment, segIndex) => {
                                            const segStart = new Date(segment.startTime).getTime();
                                            const segEnd = new Date(segment.endTime).getTime();
                                            const segDuration = (segEnd - segStart) / (1000 * 60 * 60);
                                            const leftPos = getPosition(segStart);
                                            const width = getPosition(segEnd) - leftPos;
                                            const segmentClass = getSegmentClassName(segment.segmentType);
                                            const segmentLabel = getSegmentLabel(segment.segmentType, segDuration);

                                            return (
                                                <div
                                                    key={`${step.id}-seg-${segIndex}`}
                                                    className={`timeline-bar ${segmentClass}`}
                                                    style={{
                                                        left: `${leftPos}%`,
                                                        width: `${width}%`
                                                    }}
                                                    title={`${segment.segmentType}: ${formatDateTime(new Date(segStart))} - ${formatDateTime(new Date(segEnd))} (${segDuration.toFixed(1)}h)`}
                                                >
                                                    <span className="timeline-bar-text">
                                                        {segmentLabel}
                                                    </span>
                                                </div>
                                            );
                                        })
                                ) : (
                                    // Fallback: show single bar for whole slot
                                    <div
                                        className="timeline-bar timeline-bar-process"
                                        style={{
                                            left: `${getPosition(start)}%`,
                                            width: `${getPosition(end) - getPosition(start)}%`
                                        }}
                                        title={`${formatDateTime(new Date(start))} - ${formatDateTime(new Date(end))} (${duration.toFixed(1)}h)`}
                                    >
                                        <span className="timeline-bar-text">{duration.toFixed(1)}h</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
