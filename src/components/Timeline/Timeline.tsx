import { IProviderScheduleSegment } from '../../types';
import { formatDateTimeUtc, ensureUtc } from '../../utils/dateTimeUtils';
import React, { useState, useRef } from 'react';
import ExecutionDetailsModal from '../ExecutionDetailsModal/ExecutionDetailsModal';
import './Timeline.css';

interface TimelineProps {
    segments: IProviderScheduleSegment[];
    providerId?: string;
    showTimeLabels?: boolean;
    timeRange?: {
        start: string;
        end: string;
    };
    /** Show a vertical cursor marker at this ISO time */
    cursorTime?: string;
    /** Called with the ISO time the user clicked on the track */
    onTrackClick?: (isoTime: string) => void;
}

type SegmentType = 'FreeSpace' | 'Break' | 'Occupied' | 'WorkingTime';

const getSegmentClassName = (segmentType: string): string => {
    const type = segmentType.toLowerCase();
    
    // Check for conflicts first
    if (type.includes('conflict')) {
        return 'timeline-bar-conflict';
    }
    
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
    
    // Check if it's a conflict segment
    if (type.includes('conflict-step')) {
        const stepMatch = segmentType.match(/Step(\d+)/i);
        if (stepMatch) {
            return `⚠ ${stepMatch[1]}`;
        }
    }
    
    // Check if it's a step segment (WorkingTime-StepN)
    if (type.includes('workingtime-step')) {
        const stepMatch = segmentType.match(/Step(\d+)/i);
        if (stepMatch) {
            return `${stepMatch[1]}`;
        }
    }
    
    return `${duration.toFixed(1)}h`;
};

export default function Timeline({ segments, providerId, showTimeLabels = true, timeRange, cursorTime, onTrackClick }: TimelineProps) {
    const [selectedExecution, setSelectedExecution] = useState<{ providerId: string; executionId: string } | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    if (!segments || segments.length === 0) {
        return <p className="text-muted">No timeline data available</p>;
    }

    // Calculate timeline boundaries
    let minTime: number;
    let maxTime: number;
    
    if (timeRange) {
        minTime = new Date(ensureUtc(timeRange.start)).getTime();
        maxTime = new Date(ensureUtc(timeRange.end)).getTime();
    } else {
        const startTimes = segments.map(s => new Date(ensureUtc(s.startTime)).getTime());
        const endTimes = segments.map(s => new Date(ensureUtc(s.endTime)).getTime());
        minTime = Math.min(...startTimes);
        maxTime = Math.max(...endTimes);
    }
    
    const totalDuration = maxTime - minTime;

    const getPosition = (time: number) => {
        return ((time - minTime) / totalDuration) * 100;
    };

    return (
        <div className="timeline">
            <div className="timeline-header" style={showTimeLabels ? {} : { display: 'none' }}>
                <span>{formatDateTimeUtc(new Date(minTime).toISOString())}</span>
                <span>{formatDateTimeUtc(new Date(maxTime).toISOString())}</span>
            </div>

            <div className="timeline-container">
                <div className="timeline-row">
                    <div
                        ref={trackRef}
                        className={`timeline-track ${onTrackClick ? 'timeline-track-clickable' : ''}`}
                        onClick={onTrackClick ? (e: React.MouseEvent<HTMLDivElement>) => {
                            const rect = trackRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            const clicked = new Date(minTime + ratio * totalDuration).toISOString();
                            onTrackClick(clicked);
                        } : undefined}
                    >
                        {segments.map((segment, index) => {
                            const segStart = new Date(ensureUtc(segment.startTime)).getTime();
                            const segEnd = new Date(ensureUtc(segment.endTime)).getTime();
                            const segDuration = (segEnd - segStart) / (1000 * 60 * 60);
                            const leftPos = getPosition(segStart);
                            const width = getPosition(segEnd) - leftPos;
                            const segmentClass = getSegmentClassName(segment.segmentType);
                            const segmentLabel = getSegmentLabel(segment.segmentType, segDuration);
                            const isClickable = providerId && segment.executionId && segment.segmentType.toLowerCase().includes('occupied');

                            const handleSegmentClick = () => {
                                console.log('Segment clicked:', segment);
                                if (isClickable && segment.executionId && providerId) {
                                    setSelectedExecution({ providerId, executionId: segment.executionId });
                                }
                            };

                            return (
                                <div
                                    key={`segment-${index}`}
                                    className={`timeline-bar ${segmentClass} ${isClickable ? 'timeline-bar-clickable' : ''}`}
                                    style={{
                                        left: `${leftPos}%`,
                                        width: `${width}%`
                                    }}
                                    title={`${segment.segmentType}: ${formatDateTimeUtc(new Date(segStart).toISOString())} - ${formatDateTimeUtc(new Date(segEnd).toISOString())} (${segDuration.toFixed(1)}h)${isClickable ? ' - Click for details' : ''}`}
                                    onClick={handleSegmentClick}
                                >
                                    <span className="timeline-bar-text">
                                        {segmentLabel}
                                    </span>
                                </div>
                            );
                        })}
                        {cursorTime && (() => {
                            const left = getPosition(new Date(cursorTime).getTime());
                            if (left < 0 || left > 100) return null;
                            return (
                                <div
                                    className="timeline-cursor"
                                    style={{ left: `${left}%` }}
                                    title={formatDateTimeUtc(cursorTime)}
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>

            {selectedExecution && (
                <ExecutionDetailsModal
                    isOpen={true}
                    onClose={() => setSelectedExecution(null)}
                    providerId={selectedExecution.providerId}
                    executionId={selectedExecution.executionId}
                />
            )}
        </div>
    );
}
