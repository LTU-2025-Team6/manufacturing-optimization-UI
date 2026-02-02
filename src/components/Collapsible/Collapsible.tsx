import { ReactNode, useState } from 'react';
import './Collapsible.css';
import MaterialIcon from '../MaterialIcon/MaterialIcon';

interface CollapsibleProps {
    title: string;
    defaultOpen?: boolean;
    children: ReactNode;
}

export default function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="collapsible">
            <div className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>{title}</h3>
                <span className="collapsible-icon">{isOpen ? <MaterialIcon icon="arrow_drop_down" /> : <MaterialIcon icon="arrow_drop_up" />}</span>
            </div>
            {isOpen && <div className="collapsible-content">{children}</div>}
        </div>
    );
}
