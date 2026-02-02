import { IProblemDetails } from '../../types/IProblemDetails';
import Alert from '../Alert/Alert';
import Loading from '../loading/Loading';

interface PollingStatusProps {
    requestId: string;
    status?: string;
    elapsed: number;
    loading: boolean;
    error: IProblemDetails | null;
    isTimeout: boolean;
    errorMessage?: string;
}

export default function OptimizationPollingStatus({ 
    requestId, 
    status, 
    elapsed, 
    loading, 
    error, 
    isTimeout, 
    errorMessage 
}: PollingStatusProps) {
    return (
        <>
            <p>Request ID: {requestId}</p>
            <p>Elapsed: {(elapsed / 1000).toFixed(0)}s</p>
            
            {loading && <Loading message="Polling for updates..." />}
            
            {status && (
                <>
                    <p>Status: {status}</p>
                    {getStatusMessage(status)}
                </>
            )}

            {error && (
                <Alert variant="error" title={error.title || 'Error'}>
                    {error.detail && <p>{error.detail}</p>}
                    {error.status && <p>Status code: {error.status}</p>}
                </Alert>
            )}

            {isTimeout && <p style={{ color: 'red' }}>Timeout waiting for plan</p>}

            {status === 'Failed' && (
                <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
                    <h3>Optimization Failed</h3>
                    <p>{errorMessage || 'Unknown error'}</p>
                    <p>Possible reasons:</p>
                    <ul>
                        <li>No providers available with required capabilities</li>
                        <li>Providers did not respond within timeout</li>
                        <li>No feasible solutions found for the given constraints</li>
                    </ul>
                </div>
            )}
        </>
    );
}

function getStatusMessage(status: string) {
    switch (status) {
        case 'Draft': return <p>Starting optimization...</p>;
        case 'MatchingProviders': return <p>Matching providers...</p>;
        case 'EstimatingCosts': return <p>Getting cost estimates...</p>;
        case 'GeneratingStrategies': return <p>Generating strategies...</p>;
        case 'AwaitingStrategySelection': return <p>Strategies ready!</p>;
        case 'Failed': return <p>Optimization failed</p>;
        default: return <p>{status}...</p>;
    }
}
