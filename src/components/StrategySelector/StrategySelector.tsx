import { IOptimizationStrategy } from '../../types/IOptimizationStrategy';
import StrategyCard from '../StrategyCard/StrategyCard';
import Button from '../Button/Button';
import './StrategySelector.css';

interface StrategySelectorProps {
    strategies: IOptimizationStrategy[];
    onSelect: (index: number) => void;
    selecting: boolean;
    selectedIndex: number | null;
}

export default function StrategySelector({ strategies, onSelect, selecting, selectedIndex }: StrategySelectorProps) {
    return (
        <div className="strategy-selector">
            {strategies.map((strategy, index) => (
                <div 
                    key={strategy.id} 
                    className={`strategy-selector-item ${selectedIndex === index ? 'selected' : ''}`}
                >
                    <div className="strategy-selector-header">
                        <h3>Option {index + 1}</h3>
                        <Button 
                            onClick={() => onSelect(index)} 
                            disabled={selecting || selectedIndex !== null}
                            loading={selectedIndex === index}
                        >
                            Select This Strategy
                        </Button>
                    </div>
                    <StrategyCard strategy={strategy} />
                </div>
            ))}
        </div>
    );
}
