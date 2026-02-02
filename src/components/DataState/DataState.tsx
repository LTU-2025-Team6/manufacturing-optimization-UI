import { ReactNode } from 'react';
import Loading from '../loading/Loading';
import Alert from '../Alert/Alert';
import { IProblemDetails } from '../../types/IProblemDetails';

interface DataStateProps<T> {
    loading: boolean;
    error: IProblemDetails | null;
    data: T | null;
    loadingMessage?: string;
    emptyMessage?: string;
    children: (data: T) => ReactNode;
}

export default function DataState<T>({ 
    loading, 
    error, 
    data, 
    loadingMessage,
    emptyMessage = 'No data available',
    children 
}: DataStateProps<T>) {
    if (loading) {
        return <Loading message={loadingMessage} />;
    }

    if (error) {
        return (
            <Alert variant="error" title={error.title || 'Error'}>
                {error.detail && <p>{error.detail}</p>}
                {error.status && <p>Status code: {error.status}</p>}
            </Alert>
        );
    }

    if (!data) {
        return <p>{emptyMessage}</p>;
    }

    return <>{children(data)}</>;
}
