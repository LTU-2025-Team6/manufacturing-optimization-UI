import { ReactNode } from 'react';
import './Card.css';

interface CardProps {
    title?: string;
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'flat';
}

export default function Card({ title, children, variant = 'default' }: CardProps) {
    const variantClass = variant === 'default' ? '' : `card-${variant}`;
    
    return (
        <div className={`card ${variantClass}`.trim()}>
            {title && <h3 className="card-title">{title}</h3>}
            <div className="card-content">{children}</div>
        </div>
    );
}
