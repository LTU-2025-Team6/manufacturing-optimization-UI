import { IProviderScheduleSegment } from '../../types/IProviderSchedule';
import { formatDateTime } from '../../utils/dateTimeUtils';
import React from 'react';
import './Timeline.css';

interface TimelineProps {
    segments: IProviderScheduleSegment[];
    showTimeLabels?: boolean;
    timeRange?: {
        start: string;
        end: string;
    };
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

export default function Timeline({ segments, showTimeLabels = true, timeRange }: TimelineProps) {
    if (!segments || segments.length === 0) {
        return <p className="text-muted">No timeline data available</p>;
    }

    // Calculate timeline boundaries
    let minTime: number;
    let maxTime: number;
    
    if (timeRange) {
        // Use provided time range
        minTime = new Date(timeRange.start).getTime();
        maxTime = new Date(timeRange.end).getTime();
    } else {
        // Calculate from segments
        const startTimes = segments.map(s => new Date(s.startTime).getTime());
        const endTimes = segments.map(s => new Date(s.endTime).getTime());
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
                <span>{formatDateTime(new Date(minTime).toISOString())}</span>
                <span>{formatDateTime(new Date(maxTime).toISOString())}</span>
            </div>

            <div className="timeline-container">
                <div className="timeline-row">
                    <div className="timeline-track">
                        {segments.map((segment, index) => {
                            const segStart = new Date(segment.startTime).getTime();
                            const segEnd = new Date(segment.endTime).getTime();
                            const segDuration = (segEnd - segStart) / (1000 * 60 * 60);
                            const leftPos = getPosition(segStart);
                            const width = getPosition(segEnd) - leftPos;
                            const segmentClass = getSegmentClassName(segment.segmentType);
                            const segmentLabel = getSegmentLabel(segment.segmentType, segDuration);

                            return (
                                <div
                                    key={`segment-${index}`}
                                    className={`timeline-bar ${segmentClass}`}
                                    style={{
                                        left: `${leftPos}%`,
                                        width: `${width}%`
                                    }}
                                    title={`${segment.segmentType}: ${formatDateTime(new Date(segStart).toISOString())} - ${formatDateTime(new Date(segEnd).toISOString())} (${segDuration.toFixed(1)}h)`}
                                >
                                    <span className="timeline-bar-text">
                                        {segmentLabel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
