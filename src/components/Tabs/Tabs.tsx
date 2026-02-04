import { ReactNode, useState } from 'react';
import './Tabs.css';

interface Tab {
    label: string;
    key: string;
    content: ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    initialKey?: string;
}

export default function Tabs({ tabs, initialKey }: TabsProps) {
    const [active, setActive] = useState(initialKey || tabs[0].key);
    return (
        <div>
            <div className="tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab${active === tab.key ? ' active' : ''}`}
                        onClick={() => setActive(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs.find(tab => tab.key === active)?.content}
            </div>
        </div>
    );
}
