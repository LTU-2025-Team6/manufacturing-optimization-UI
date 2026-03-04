import { ReactElement, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProviders, useGetProvider, useToggleProvider } from '../../hooks/api/providerApi';
import { IProvider, IProviderPreview } from '../../types';
import { DEFAULT_PAGE_SIZE } from '../../types';
import DataState from '../../components/DataState/DataState';
import ProviderDetails from '../../components/ProviderDetails/ProviderDetails';
import Button from '../../components/Button/Button';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import Alert from '../../components/Alert/Alert';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Pagination from '../../components/Pagination/Pagination';
import { IProblemDetails } from '../../types';
import { useState } from 'react';
import './ProviderListPage.css';

const ProviderListPage = (): ReactElement => {
    const navigate = useNavigate();
    const { providerId } = useParams<{ providerId: string }>();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);
    const { data, loading, error, callApi } = useGetProviders();
    const { data: providerDetails, loading: loadingDetails, error: errorDetails, callApi: getProviderDetails } = useGetProvider();
    const { callApi: toggleProvider } = useToggleProvider();
    const [toggleError, setToggleError] = useState<IProblemDetails | null>(null);

    useEffect(() => {
        callApi(page, pageSize);
    }, [page, pageSize]);

    useEffect(() => {
        if (providerId) {
            getProviderDetails(providerId);
        }
    }, [providerId]);

    const handleProviderClick = (provider: IProviderPreview) => {
        navigate(`/providers/list/${provider.id}`);
    };

    const handleToggleProvider = async (e: React.MouseEvent, provider: IProviderPreview) => {
        e.stopPropagation();
        setToggleError(null);
        try {
            await toggleProvider(provider.id, !provider.isRunning);
            await callApi(page, pageSize); // Refresh the list
            if (providerId === provider.id) {
                await getProviderDetails(provider.id); // Refresh details if selected
            }
        } catch (err: any) {
            setToggleError(err);
        }
    };

    return (
        <div className='provider-list-view'>
            <div className="provider-list-page-header">
                <h1>Providers List</h1>
                <Button 
                    variant="primary"
                    onClick={() => navigate('/providers/create')}
                >
                    <MaterialIcon icon="add" />
                    Create Provider
                </Button>
            </div>

            {toggleError && (
                <div className="provider-list-error-banner">
                    <Alert variant="error">
                        Failed to toggle provider: {toggleError.title || toggleError.detail || 'Unknown error'}
                    </Alert>
                </div>
            )}
            
            <DataState 
                loading={loading} 
                error={error} 
                data={data}
                loadingMessage="Loading providers..."
                emptyMessage="No providers available"
            >
                {(pagedResult) => (
                    <div className="provider-list-layout">
                        <div className="provider-list-sidebar">
                            <div className="provider-list-sidebar-header">
                                <h3>Providers ({pagedResult.totalCount})</h3>
                            </div>
                            {pagedResult.items.map(provider => (
                                <div 
                                    key={provider.id}
                                    className={`provider-list-item ${providerId === provider.id ? 'active' : ''} ${!provider.isRunning ? 'disabled' : ''}`}
                                >
                                    <div 
                                        className="provider-list-item-content"
                                        onClick={() => handleProviderClick(provider)}
                                        title="Click to view details"
                                    >
                                        <div className="provider-list-item-info">
                                            <h3>{provider.name}</h3>
                                            <p>{provider.type}</p>
                                        </div>
                                        {!provider.isRunning && <StatusBadge status="Offline" variant="offline" />}
                                    </div>
                                    <div className="provider-list-item-actions">
                                        <button 
                                            className="provider-action-btn provider-action-btn-edit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/providers/${provider.id}`);
                                            }}
                                            title="Edit provider"
                                        >
                                            <MaterialIcon icon="edit" size="S" />
                                        </button>
                                        <button 
                                            className={`provider-action-btn ${
                                                provider.isRunning 
                                                    ? 'provider-action-btn-stop' 
                                                    : 'provider-action-btn-start'
                                            }`}
                                            onClick={(e) => handleToggleProvider(e, provider)}
                                            title={provider.isRunning ? 'Stop provider' : 'Start provider'}
                                        >
                                            <MaterialIcon 
                                                icon={provider.isRunning ? 'stop' : 'play_arrow'} 
                                                size="S" 
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <Pagination 
                                pageNumber={pagedResult.pageNumber}
                                totalPages={pagedResult.totalPages}
                                totalCount={pagedResult.totalCount}
                                hasPreviousPage={pagedResult.hasPreviousPage}
                                hasNextPage={pagedResult.hasNextPage}
                                onPageChange={setPage}
                                pageSize={pageSize}
                            />
                        </div>
                        <div className="provider-details-container">
                            {providerId ? (
                                <DataState 
                                    loading={loadingDetails} 
                                    error={errorDetails} 
                                    data={providerDetails}
                                    loadingMessage="Loading provider details..."
                                    emptyMessage="Provider not found"
                                >
                                    {(provider) => (
                                        <ProviderDetails provider={provider} />
                                    )}
                                </DataState>
                            ) : (
                                <div className="provider-list-empty">
                                    <p>Select a provider to view details</p>
                                    <p className="provider-list-hint">Double-click to open in separate page</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DataState>
        </div>
    );
};

export default ProviderListPage;