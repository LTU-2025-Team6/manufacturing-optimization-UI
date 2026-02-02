import { ReactElement, ReactNode } from 'react';
import './Alert.css';
import MaterialIcon from '../MaterialIcon/MaterialIcon';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    children: ReactNode;
    icon?: string;
}

const Alert = ({ variant = 'info', title, children, icon }: AlertProps): ReactElement => {
    const defaultIcons: Record<AlertVariant, ReactElement> = {
        success: <MaterialIcon icon="check" />,
        error: <MaterialIcon icon="error" />,
        warning: <MaterialIcon icon="warning" />,
        info: <MaterialIcon icon="info" />
    };

    const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

    return (
        <div className={`alert alert-${variant}`}>
            {title && (
                <h3 className="alert-title">
                    {displayIcon && <span className="alert-icon">{displayIcon}</span>}
                    {title}
                </h3>
            )}
            <div className="alert-content">{children}</div>
        </div>
    );
};

export default Alert;
