import Spinner from '../Spinner/Spinner';

interface LoadingProps {
    message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
            <Spinner />
            <span>{message}</span>
        </div>
    );
}
