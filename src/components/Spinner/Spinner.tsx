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
            border: '3px solid var(--color-border)',
            borderTop: '3px solid var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
    );
}
