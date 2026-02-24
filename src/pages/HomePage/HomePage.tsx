import { ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import { useGetDashboardStats } from '../../hooks/api/dashboardApi';
import DataState from '../../components/DataState/DataState';
import './HomePage.css';

const HomePage = (): ReactElement => {
    const navigate = useNavigate();
    const { data: stats, loading, error, callApi } = useGetDashboardStats();

    useEffect(() => {
        callApi();
    }, []);

    return (
        <DataState
            loading={loading}
            error={error}
            data={stats}
            loadingMessage="Loading dashboard..."
            emptyMessage="Dashboard statistics are not available at the moment"
        >
            {(stats) => (
                <div className='home-page'>
                    {/* Welcome Section */}
                    <section className="home-welcome">
                        <div className="welcome-content">
                            <h1 className="welcome-title">Welcome to MOE</h1>
                            <p className="welcome-subtitle">
                                Manufacturing Optimization Engine - Your intelligent platform for process optimization
                            </p>
                        </div>
                    </section>

                    {/* Stats Grid */}
                    <section className="home-stats-grid">
                        <div className="stat-card stat-primary">
                            <div className="stat-icon">
                                <MaterialIcon icon="inventory" size="XL" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.totalPlans}</div>
                                <div className="stat-label">Optimization Plans</div>
                                <div className="stat-meta">Total created</div>
                            </div>
                        </div>

                        <div className="stat-card stat-success">
                            <div className="stat-icon">
                                <MaterialIcon icon="factory" size="XL" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.activeProviders}</div>
                                <div className="stat-label">Active Providers</div>
                                <div className="stat-meta">Registered & verified</div>
                            </div>
                        </div>

                        <div className="stat-card stat-warning">
                            <div className="stat-icon">
                                <MaterialIcon icon="sync" size="XL" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.runningOptimizations}</div>
                                <div className="stat-label">Running Now</div>
                                <div className="stat-meta">In progress</div>
                    </div>
                </div>

                <div className="stat-card stat-info">
                    <div className="stat-icon">
                        <MaterialIcon icon="check_circle" size="XL" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.completedThisMonth}</div>
                        <div className="stat-label">Completed</div>
                        <div className="stat-meta">This month</div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="home-actions">
                <h2 className="actions-title">Quick Actions</h2>
                <div className="actions-grid">
                    <button 
                        className="action-button action-primary" 
                        onClick={() => navigate('/optimization-request')}
                    >
                        <MaterialIcon icon="add_circle" size="L" />
                        <span className="action-title">New Optimization</span>
                        <span className="action-subtitle">Create optimization request</span>
                    </button>
                    
                    <button 
                        className="action-button action-secondary" 
                        onClick={() => navigate('/plans')}
                    >
                        <MaterialIcon icon="analytics" size="L" />
                        <span className="action-title">View Plans</span>
                        <span className="action-subtitle">Browse all plans</span>
                    </button>
                    
                    <button 
                        className="action-button action-secondary" 
                        onClick={() => navigate('/providers')}
                    >
                        <MaterialIcon icon="business" size="L" />
                        <span className="action-title">Providers</span>
                        <span className="action-subtitle">Manage providers</span>
                    </button>

                    <button 
                        className="action-button action-secondary" 
                        onClick={() => navigate('/notifications')}
                    >
                        <MaterialIcon icon="notifications" size="L" />
                        <span className="action-title">Notifications</span>
                        <span className="action-subtitle">View updates</span>
                    </button>
                </div>
            </section>
        </div>
            )}
        </DataState>
    );
};

export default HomePage;