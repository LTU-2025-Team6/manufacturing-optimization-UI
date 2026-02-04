import { ReactElement } from 'react';
import { IProviderBreakPeriod } from '../../types/IProvider';
import Button from '../Button/Button';
import './BreakPeriodsEditor.css';

interface BreakPeriodsEditorProps {
    breaks: IProviderBreakPeriod[];
    onChange: (breaks: IProviderBreakPeriod[]) => void;
}

const BreakPeriodsEditor = ({ breaks, onChange }: BreakPeriodsEditorProps): ReactElement => {
    const addBreak = () => {
        const newBreak: IProviderBreakPeriod = {
            name: 'Break',
            startHour: 12,
            startMinute: 0,
            durationMinutes: 30
        };
        onChange([...breaks, newBreak]);
    };

    const updateBreak = (index: number, field: keyof IProviderBreakPeriod, value: any) => {
        const updatedBreaks = [...breaks];
        updatedBreaks[index] = {
            ...updatedBreaks[index],
            [field]: value
        };
        onChange(updatedBreaks);
    };

    const removeBreak = (index: number) => {
        const updatedBreaks = breaks.filter((_, i) => i !== index);
        onChange(updatedBreaks);
    };

    return (
        <div className="break-periods-editor">
            <div className="break-periods-list">
                {breaks.map((breakPeriod, index) => (
                    <div key={index} className="break-period-card">
                        <div className="break-period-header">
                            <h5>Break {index + 1}</h5>
                            <Button 
                                onClick={() => removeBreak(index)}
                                variant="secondary"
                            >
                                Remove
                            </Button>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name</label>
                                <input 
                                    type="text" 
                                    value={breakPeriod.name}
                                    onChange={(e) => updateBreak(index, 'name', e.target.value)}
                                    className="form-input"
                                    placeholder="e.g. Lunch Break"
                                />
                            </div>
                            <div className="form-group">
                                <label>Duration (minutes)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={breakPeriod.durationMinutes}
                                    onChange={(e) => updateBreak(index, 'durationMinutes', Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Hour (0-23)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    max="23"
                                    value={breakPeriod.startHour}
                                    onChange={(e) => updateBreak(index, 'startHour', Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Minute (0-59)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    max="59"
                                    value={breakPeriod.startMinute}
                                    onChange={(e) => updateBreak(index, 'startMinute', Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button 
                onClick={addBreak}
                variant="primary"
            >
                + Add Break Period
            </Button>

            {breaks.length === 0 && (
                <p className="info-text">No break periods defined. Add one to get started.</p>
            )}
        </div>
    );
};

export default BreakPeriodsEditor;
