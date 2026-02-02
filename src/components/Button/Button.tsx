import { ReactNode, ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    children: ReactNode;
}

export default function Button({ variant = 'primary', loading, children, disabled, ...props }: ButtonProps) {
    return (
        <button 
            {...props} 
            disabled={disabled || loading}
            className={`btn btn-${variant}`}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
}
