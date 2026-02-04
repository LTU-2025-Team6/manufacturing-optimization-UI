import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProviders, useGetProvider, useToggleProvider } from '../../hooks/api/providerApi';
import { IProvider, IProviderPreview } from '../../types/IProvider';
import DataState from '../../components/DataState/DataState';
import ProviderDetails from '../../components/ProviderDetails/ProviderDetails';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import { IProblemDetails } from '../../types/IProblemDetails';
import './ProviderListPage.css';

const ProviderListPage = (): ReactElement => {
    const navigate = useNavigate();
    const { data, loading, error, callApi } = useGetProviders();
    const { data: providerDetails, loading: loadingDetails, error: errorDetails, callApi: getProviderDetails } = useGetProvider();
    const { callApi: toggleProvider } = useToggleProvider();
    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
    const [toggleError, setToggleError] = useState<IProblemDetails | null>(null);

    useEffect(() => {
        callApi();
    }, []);

    const handleProviderClick = (provider: IProviderPreview) => {
        setSelectedProviderId(provider.id);
        getProviderDetails(provider.id);
    };

    const handleProviderDoubleClick = (providerId: string) => {
        navigate(`/providers/${providerId}`);
    };

    const handleToggleProvider = async (e: React.MouseEvent, provider: IProviderPreview) => {
        e.stopPropagation();
        setToggleError(null);
        try {
            await toggleProvider(provider.id, !provider.isRunning);
            await callApi(); // Refresh the list
            if (selectedProviderId === provider.id) {
                await getProviderDetails(provider.id); // Refresh details if selected
            }
        } catch (err: any) {
            setToggleError(err);
        }
    };

    return (
        <div className='provider-list-view'>
            <h1>Providers List</h1>

            {toggleError && (
                <Alert variant="error">
                    Failed to toggle provider: {toggleError.title || toggleError.detail || 'Unknown error'}
                </Alert>
            )}
            
            <DataState 
                loading={loading} 
                error={error} 
                data={data}
                loadingMessage="Loading providers..."
                emptyMessage="No providers available"
            >
                {(providers) => (
                    <div className="provider-list-layout">
                        <div className="provider-list-sidebar">
                            <h3>Providers ({providers.length})</h3>
                            {providers.map(provider => (
                                <div 
                                    key={provider.id}
                                    className={`provider-list-item ${selectedProviderId === provider.id ? 'active' : ''} ${!provider.isRunning ? 'disabled' : ''}`}
                                >
                                    <div 
                                        className="provider-list-item-content"
                                        onClick={() => handleProviderClick(provider)}
                                        onDoubleClick={() => handleProviderDoubleClick(provider.id)}
                                        title="Double-click to open in separate page"
                                    >
                                        <h3>{provider.name}</h3>
                                        <p>{provider.type}</p>
                                        {!provider.isRunning && <span className="status-badge">Offline</span>}
                                    </div>
                                    <Button 
                                        onClick={(e) => handleToggleProvider(e, provider)}
                                        variant={provider.isRunning ? 'secondary' : 'primary'}
                                    >
                                        {provider.isRunning ? 'Stop' : 'Start'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="provider-details-container">
                            {selectedProviderId ? (
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