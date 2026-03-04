import { useState, useEffect } from 'react';
import { useAllPlansPolling } from '../../hooks/api/executionApi';
import { IExecutionPlanSummary, DEFAULT_PAGE_SIZE } from '../../types';
import DataState from '../DataState/DataState';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Pagination from '../Pagination/Pagination';
import StatusBadge from '../StatusBadge/StatusBadge';
import './ExecutionList.css';

interface ExecutionListProps {
    onSelectExecution: (planId: string) => void;
    selectedPlanId: string | null;
}

function formatDateRelative(dateString: string | null): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export default function ExecutionList({ onSelectExecution, selectedPlanId }: ExecutionListProps) {
    const [page, setPage] = useState(1);
    const { data: pagedPlans, loading, error, restart } = useAllPlansPolling(page, DEFAULT_PAGE_SIZE, 3000);

    // Restart polling immediately when page changes
    useEffect(() => {
        restart();
    }, [page]);

    const handleSelectExecution = (planId: string) => {
        onSelectExecution(planId);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <div className="execution-list">
            <div className="execution-list-header">
                <h2>Execution Plans</h2>
                {pagedPlans && <span className="execution-count">{pagedPlans.totalCount}</span>}
            </div>
            
            <DataState
                loading={loading}
                error={error}
                data={pagedPlans}
                loadingMessage="Loading execution plans..."
                emptyMessage="No execution plans found"
            >
                {(pagedResult) => (
                    <>
                        <div className="execution-items">
                            {pagedResult.items.map((execution: IExecutionPlanSummary) => (
                                <ExecutionListItem
                                    key={execution.id}
                                    execution={execution}
                                    isSelected={execution.id === selectedPlanId}
                                    onSelect={handleSelectExecution}
                                />
                            ))}
                        </div>
                        {pagedResult.totalPages > 1 && (
                            <Pagination
                                pageNumber={pagedResult.pageNumber}
                                totalPages={pagedResult.totalPages}
                                totalCount={pagedResult.totalCount}
                                hasPreviousPage={pagedResult.hasPreviousPage}
                                hasNextPage={pagedResult.hasNextPage}
                                onPageChange={handlePageChange}
                                pageSize={DEFAULT_PAGE_SIZE}
                            />
                        )}
                    </>
                )}
            </DataState>
        </div>
    );
}

interface ExecutionListItemProps {
    execution: IExecutionPlanSummary;
    isSelected: boolean;
    onSelect: (planId: string) => void;
}

function ExecutionListItem({ execution, isSelected, onSelect }: ExecutionListItemProps) {
    const createTime = formatDateRelative(execution.createdAt);

    return (
        <div 
            className={`execution-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(execution.id)}
        >
            <div className="execution-item-header">
                <div className="execution-item-title">
                    <MaterialIcon icon="assignment" size="S" />
                    <span className="execution-item-id">
                        {execution.id.substring(0, 8)}
                    </span>
                </div>
                <StatusBadge status={execution.status} />
            </div>
            
            <div className="execution-progress">
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${execution.progressPercentage}%` }}
                    />
                </div>
                <div className="progress-stats">
                    <span className="progress-text">
                        {execution.completedSteps}/{execution.totalSteps} completed
                    </span>
                    <span className="progress-percentage">
                        {execution.progressPercentage.toFixed(0)}%
                    </span>
                </div>
            </div>

            {execution.inProgressSteps > 0 && (
                <div className="execution-meta">
                    <MaterialIcon icon="pending" size="S" />
                    <span>{execution.inProgressSteps} in progress</span>
                </div>
            )}

            {execution.failedSteps > 0 && (
                <div className="execution-meta error">
                    <MaterialIcon icon="error" size="S" />
                    <span>{execution.failedSteps} failed</span>
                </div>
            )}
            
            <div className="execution-item-footer">
                <span className="execution-time">{createTime}</span>
                {execution.completedAt && (
                    <MaterialIcon icon="check_circle" size="S" />
                )}
            </div>
        </div>
    );
}
