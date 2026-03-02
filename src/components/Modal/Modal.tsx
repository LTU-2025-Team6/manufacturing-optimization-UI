import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'small' | 'medium' | 'large';
}

export default function Modal({ isOpen, onClose, title, children, size = 'medium' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className={`modal-container modal-${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button 
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <MaterialIcon icon="close" />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
