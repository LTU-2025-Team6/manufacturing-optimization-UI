import { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
}

export default function Card({ title, children }: CardProps) {
    return (
        <div style={{ 
            border: '1px solid var(--color-border)', 
            borderRadius: '4px', 
            padding: '16px',
            marginBottom: '16px'
        }}>
            {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
            {children}
        </div>
    );
}
