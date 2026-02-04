import { ReactNode, ButtonHTMLAttributes, useState } from 'react';
import './Button.css';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    children: ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export default function Button({ variant = 'primary', loading, children, disabled, onClick, ...props }: ButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!onClick || isProcessing) return;

        const result = onClick(event);
        
        // If onClick returns a Promise, track its loading state
        if (result instanceof Promise) {
            setIsProcessing(true);
            try {
                await result;
            } catch (error) {
                console.error('Button async operation failed:', error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const isDisabled = disabled || loading || isProcessing;
    const displayText = loading || isProcessing ? 'Loading...' : children;

    return (
        <button 
            {...props} 
            onClick={handleClick}
            disabled={isDisabled}
            className={`btn btn-${variant}`}
        >
            {displayText}
        </button>
    );
}
