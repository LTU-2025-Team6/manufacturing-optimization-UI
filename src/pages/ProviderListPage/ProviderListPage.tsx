import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProviders } from '../../hooks/api/providerApi';
import { IProvider } from '../../types/IProvider';
import DataState from '../../components/DataState/DataState';
import ProviderDetails from '../../components/ProviderDetails/ProviderDetails';
import './ProviderListPage.css';

const ProviderListPage = (): ReactElement => {
    const navigate = useNavigate();
    const { data, loading, error, callApi } = useGetProviders();
    const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(null);

    useEffect(() => {
        callApi();
    }, []);

    return (
        <div className='provider-list-view'>
            <h1>Providers List</h1>
            
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
                                    className={`provider-list-item ${selectedProvider?.id === provider.id ? 'active' : ''}`}
                                    onClick={() => setSelectedProvider(provider)}
                                >
                                    <h3>{provider.name}</h3>
                                    <p>{provider.type}</p>
                                </div>
                            ))}
                        </div>
                        <div className="provider-details-container">
                            {selectedProvider ? (
                                <ProviderDetails provider={selectedProvider} />
                            ) : (
                                <div className="provider-list-empty">
                                    <p>Select a provider to view details</p>
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