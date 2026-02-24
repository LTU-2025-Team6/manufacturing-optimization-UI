export default function Spinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
    const sizeMap = {
        small: '16px',
        medium: '24px',
        large: '32px'
    };

    return (
        <div style={{ 
            display: 'inline-block', 
            width: sizeMap[size], 
            height: sizeMap[size],
            border: '3px solid var(--ds-color-border-default)',
            borderTop: '3px solid var(--ds-color-accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
    );
}
