import './StatusBadge.css';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'completed' | 'inprogress' | 'failed' | 'confirmed' | 'processing' | 'offline';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
}

function getVariantFromStatus(status: string): StatusVariant {
    const statusLower = status.toLowerCase().replace(/\s+/g, '');
    
    // Exact matches first
    if (statusLower === 'completed') return 'completed';
    if (statusLower === 'inprogress' || statusLower === 'in-progress') return 'inprogress';
    if (statusLower === 'failed') return 'failed';
    if (statusLower === 'confirmed') return 'confirmed';
    if (statusLower === 'offline') return 'offline';
    
    // Pattern matches
    if (statusLower.includes('completed')) return 'success';
    if (statusLower.includes('failed') || statusLower.includes('error')) return 'error';
    if (statusLower.includes('inprogress') || statusLower.includes('in-progress') || statusLower.includes('processing')) return 'warning';
    if (statusLower.includes('confirmed') || statusLower.includes('ready') || statusLower.includes('submitted')) return 'info';
    
    return 'info';
}

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
    const badgeVariant = variant || getVariantFromStatus(status);
    
    return (
        <span className={`status-badge status-badge-${badgeVariant}`}>
            {status}
        </span>
    );
}
