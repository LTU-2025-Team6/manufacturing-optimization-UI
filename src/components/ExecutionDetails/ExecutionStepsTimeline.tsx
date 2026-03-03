import { IExecutionStep, StepExecutionStatus } from '../../types/IExecution';
import './ExecutionStepsTimeline.css';

interface ExecutionStepsTimelineProps {
    steps: IExecutionStep[];
}

function getStepStatusClass(status: StepExecutionStatus): string {
    switch (status) {
        case 'Pending':
            return 'execution-status-pending';
        case 'InProgress':
            return 'execution-status-inprogress';
        case 'Completed':
            return 'execution-status-completed';
        case 'Failed':
            return 'execution-status-failed';
        case 'Cancelled':
            return 'execution-status-cancelled';
        default:
            return 'execution-status-pending';
    }
}

function parseDuration(durationStr: string | null): number {
    if (!durationStr) return 0;
    // Parse TimeSpan format like "02:30:00" or "1.05:30:00"
    const parts = durationStr.split(':');
    if (parts.length >= 2) {
        const hours = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        return hours + minutes / 60;
    }
    return 0;
}

function formatDuration(durationStr: string | null): string {
    const hours = parseDuration(durationStr);
    if (hours < 1) {
        return `${Math.round(hours * 60)}min`;
    }
    return `${hours.toFixed(1)}h`;
}

function formatTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function ExecutionStepsTimeline({ steps }: ExecutionStepsTimelineProps) {
    if (!steps || steps.length === 0) {
        return <div className="execution-timeline-empty">No steps to display</div>;
    }

    // Filter steps with valid scheduled times
    const validSteps = steps.filter(s => s.scheduledStart && s.scheduledEnd);
    
    if (validSteps.length === 0) {
        return <div className="execution-timeline-empty">No scheduled steps to display</div>;
    }

    // Calculate timeline range
    const startTimes = validSteps.map(s => new Date(s.scheduledStart!).getTime());
    const endTimes = validSteps.map(s => new Date(s.scheduledEnd!).getTime());
    const minTime = Math.min(...startTimes);
    const maxTime = Math.max(...endTimes);
    const totalDuration = maxTime - minTime;

    // Generate time axis labels (5 evenly spaced points)
    const timeLabels = [];
    const labelCount = 5;
    for (let i = 0; i < labelCount; i++) {
        const timePoint = minTime + (totalDuration * i / (labelCount - 1));
        const position = (i / (labelCount - 1)) * 100;
        timeLabels.push({
            time: new Date(timePoint).toISOString(),
            position: position
        });
    }

    return (
        <div className="execution-steps-timeline">
            <div className="execution-timeline-container">
                {validSteps.map((step) => {
                    const stepStart = new Date(step.scheduledStart!).getTime();
                    const stepEnd = new Date(step.scheduledEnd!).getTime();
                    const stepDuration = stepEnd - stepStart;
                    
                    const leftPercent = ((stepStart - minTime) / totalDuration) * 100;
                    const widthPercent = (stepDuration / totalDuration) * 100;
                    const statusClass = getStepStatusClass(step.status);

                    return (
                        <div key={step.id} className="execution-timeline-row">
                            <div className="execution-timeline-label">
                                <span className="execution-step-number">#{step.stepNumber}</span>
                                <span className="execution-step-process">{step.processName}</span>
                            </div>
                            
                            <div className="execution-timeline-track">
                                <div 
                                    className={`execution-timeline-bar ${statusClass}`}
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`
                                    }}
                                    title={`${step.processName} - ${step.providerName}\n${formatTime(step.scheduledStart)} - ${formatTime(step.scheduledEnd)}\nStatus: ${step.status}`}
                                >
                                    <span className="execution-timeline-bar-label">
                                        {step.providerName} ({formatDuration(step.estimatedDuration)})
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="execution-time-axis">
                <div></div>
                <div className="time-axis-track">
                    {timeLabels.map((label, index) => (
                        <div 
                            key={index} 
                            className="time-label" 
                            style={{ left: `${label.position}%` }}
                        >
                            {formatDateTime(label.time)}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="execution-timeline-legend">
                <div className="execution-legend-item">
                    <div className="execution-legend-color execution-status-pending" />
                    <span>Pending</span>
                </div>
                <div className="execution-legend-item">
                    <div className="execution-legend-color execution-status-inprogress" />
                    <span>In Progress</span>
                </div>
                <div className="execution-legend-item">
                    <div className="execution-legend-color execution-status-completed" />
                    <span>Completed</span>
                </div>
                <div className="execution-legend-item">
                    <div className="execution-legend-color execution-status-failed" />
                    <span>Failed</span>
                </div>
                <div className="execution-legend-item">
                    <div className="execution-legend-color execution-status-cancelled" />
                    <span>Cancelled</span>
                </div>
            </div>
        </div>
    );
}
