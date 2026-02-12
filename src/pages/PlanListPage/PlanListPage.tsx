import { ReactElement, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DataState from '../../components/DataState/DataState';
import { IOptimizationPlanPreview } from '../../types/IOptimizationPlan';
import { useGetOptimizationPlans } from '../../hooks/api/planApi';
import { formatDateTime } from '../../utils/dateTimeUtils';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import './PlanListPage.css';

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return `${diffDays}d ago`;
    }
}

function getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('confirmed')) return 'confirmed';
    if (statusLower.includes('failed')) return 'failed';
    return 'processing';
}

const PlanListPage = (): ReactElement => {
    const navigate = useNavigate();
    const { data, loading, error, callApi } = useGetOptimizationPlans();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        callApi();
    }, []);

    const handlePlanClick = (plan: IOptimizationPlanPreview) => {
        navigate(`/plan/${plan.requestId}`);
    };

    // Filter plans based on search query
    const filteredPlans = useMemo(() => {
        if (!data || !searchQuery.trim()) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(plan => 
            plan.id.toLowerCase().includes(query) ||
            plan.requestId.toLowerCase().includes(query) ||
            plan.status.toLowerCase().includes(query)
        );
    }, [data, searchQuery]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!data) return { total: 0, completed: 0, processing: 0, failed: 0 };
        
        return {
            total: data.length,
            completed: data.filter(p => getStatusClass(p.status) === 'completed').length,
            processing: data.filter(p => getStatusClass(p.status) === 'processing').length,
            failed: data.filter(p => getStatusClass(p.status) === 'failed').length,
        };
    }, [data]);

    return (
        <div className="plan-list-page">
            <div className="plan-list-header">
                <h1 className="plan-list-title">Optimization Plans</h1>
                <p className="plan-list-subtitle">
                    View and manage your manufacturing optimization plans
                </p>
            </div>

            <DataState 
                loading={loading} 
                error={error} 
                data={data}
                loadingMessage="Loading optimization plans..."
                emptyMessage="No optimization plans available"
            >
                {(plans: IOptimizationPlanPreview[]) => (
                    <>
                        {/* Statistics */}
                        <div className="plan-list-stats">
                            <div className="plan-stat-card">
                                <div className="plan-stat-value">{stats.total}</div>
                                <div className="plan-stat-label">Total Plans</div>
                            </div>
                            <div className="plan-stat-card">
                                <div className="plan-stat-value">{stats.completed}</div>
                                <div className="plan-stat-label">Completed</div>
                            </div>
                            <div className="plan-stat-card">
                                <div className="plan-stat-value">{stats.processing}</div>
                                <div className="plan-stat-label">Processing</div>
                            </div>
                            <div className="plan-stat-card">
                                <div className="plan-stat-value">{stats.failed}</div>
                                <div className="plan-stat-label">Failed</div>
                            </div>
                        </div>

                        {/* Search and Filters (prepared for future enhancements) */}
                        <div className="plan-list-filters">
                            <input
                                type="text"
                                className="plan-list-search"
                                placeholder="Search by ID, request ID, or status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {/* Future: Add filter dropdowns, sorting options, date range picker */}
                        </div>

                        {/* Plans Grid */}
                        <div className="plan-list-grid">
                            {filteredPlans && filteredPlans.length > 0 ? (
                                filteredPlans.map(plan => (
                                    <div 
                                        key={plan.id} 
                                        className="plan-card"
                                        onClick={() => handlePlanClick(plan)}
                                    >
                                        <div className="plan-card-header">
                                            <div className="plan-card-id">
                                                #{plan.id.slice(0, 8)}
                                            </div>
                                            <span className={`plan-status-badge ${getStatusClass(plan.status)}`}>
                                                {plan.status}
                                            </span>
                                        </div>

                                        <div className="plan-card-body">
                                            <div className="plan-card-meta">
                                                <MaterialIcon icon="schedule" />
                                                <span>Created {formatRelativeTime(new Date(plan.createdAt))}</span>
                                            </div>
                                            <div className="plan-card-meta">
                                                <MaterialIcon icon="event" />
                                                <span>{formatDateTime(plan.createdAt, { year: 'numeric' })}</span>
                                            </div>

                                            {/* Metrics Section - prepared for future API data */}
                                            {/* {plan.metrics && (
                                                <div className="plan-card-metrics">
                                                    {plan.metrics.totalCost && (
                                                        <div className="plan-metric">
                                                            <span className="plan-metric-label">Total Cost</span>
                                                            <span className="plan-metric-value">
                                                                ${plan.metrics.totalCost.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {plan.metrics.totalDuration && (
                                                        <div className="plan-metric">
                                                            <span className="plan-metric-label">Duration</span>
                                                            <span className="plan-metric-value">
                                                                {plan.metrics.totalDuration}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {plan.metrics.providerCount !== undefined && (
                                                        <div className="plan-metric">
                                                            <span className="plan-metric-label">Providers</span>
                                                            <span className="plan-metric-value">
                                                                {plan.metrics.providerCount}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {plan.metrics.stepCount !== undefined && (
                                                        <div className="plan-metric">
                                                            <span className="plan-metric-label">Steps</span>
                                                            <span className="plan-metric-value">
                                                                {plan.metrics.stepCount}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )} */}
                                        </div>

                                        <div className="plan-card-footer">
                                            <span className="plan-request-id">
                                                Request: {plan.requestId.slice(0, 8)}...
                                            </span>
                                            <MaterialIcon icon="arrow_forward" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="plan-list-empty">
                                    <MaterialIcon icon="search_off" />
                                    <p>No plans match your search</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DataState>
        </div>
    );
};

export default PlanListPage;