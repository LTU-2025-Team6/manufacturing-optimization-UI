import { IExecutionStep, StepExecutionStatus } from '../../types/IExecution';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './ExecutionStepsTable.css';

interface ExecutionStepsTableProps {
    steps: IExecutionStep[];
}

function getStatusClass(status: StepExecutionStatus): string {
    switch (status) {
        case 'Pending':
            return 'info';
        case 'InProgress':
            return 'warning';
        case 'Completed':
            return 'success';
        case 'Failed':
            return 'error';
        case 'Cancelled':
            return 'secondary';
        default:
            return 'info';
    }
}

function formatDateTime(dateString: string | null): string {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDuration(durationStr: string | null): string {
    if (!durationStr) return 'N/A';
    // Parse TimeSpan format like "02:30:00" or "1.05:30:00"
    const parts = durationStr.split(':');
    if (parts.length >= 2) {
        const hours = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        if (hours < 1) {
            return `${Math.round(hours * 60 + minutes)} min`;
        }
        return `${hours.toFixed(1)} h`;
    }
    return durationStr;
}

function formatCost(cost: number | null): string {
    if (cost === null || cost === undefined) return 'N/A';
    return `$${cost.toFixed(2)}`;
}

export default function ExecutionStepsTable({ steps }: ExecutionStepsTableProps) {
    if (!steps || steps.length === 0) {
        return <div className="table-empty">No steps to display</div>;
    }

    return (
        <div className="execution-steps-table">
            <div className="table-responsive">
                <table className="steps-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Process</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Cost</th>
                            <th>Scheduled Start</th>
                            <th>Scheduled End</th>
                        </tr>
                    </thead>
                    <tbody>
                        {steps.map((step) => (
                            <tr key={step.id}>
                                <td className="step-number-cell">{step.stepNumber}</td>
                                <td className="process-cell">
                                    <div className="cell-content">
                                        <MaterialIcon icon="settings" size="S" />
                                        {step.processName}
                                    </div>
                                </td>
                                <td className="provider-cell">{step.providerName}</td>
                                <td>
                                    <span className={`status-badge status-badge-${getStatusClass(step.status)}`}>
                                        {step.status}
                                    </span>
                                </td>
                                <td className="duration-cell">{formatDuration(step.estimatedDuration)}</td>
                                <td className="cost-cell">{formatCost(step.estimatedCost)}</td>
                                <td className="datetime-cell">{formatDateTime(step.scheduledStart)}</td>
                                <td className="datetime-cell">{formatDateTime(step.scheduledEnd)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

