import { useState, useRef, useEffect } from 'react';
import { useSimulationTimePolling, useSetSimulationTime } from '../../hooks/api/simulationTimeApi';
import { formatDateTime, fromLocalDateTimeInput, toLocalDateTimeInput } from '../../utils/dateTimeUtils';
import Button from '../Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './SimulationTimePanel.css';

export default function SimulationTimePanel() {
    const { data: timeData } = useSimulationTimePolling(2000);
    const { callApi: setTime, loading: settingTime } = useSetSimulationTime();
    
    // Keep last valid data to prevent flickering
    const lastValidDataRef = useRef(timeData);
    
    useEffect(() => {
        if (timeData) {
            lastValidDataRef.current = timeData;
        }
    }, [timeData]);
    
    const displayData = timeData || lastValidDataRef.current;

    const [dateTimeInput, setDateTimeInput] = useState('');
    const [multiplierInput, setMultiplierInput] = useState('');

    const handleSetDateTime = async () => {
        if (!dateTimeInput) return;
        try {
            // Convert datetime-local input (local timezone) to UTC ISO string
            const utcDate = fromLocalDateTimeInput(dateTimeInput);
            await setTime({ simulatedUtcNow: utcDate });
            setDateTimeInput('');
        } catch (err) {
            console.error('Failed to set time:', err);
        }
    };

    const handleSetMultiplier = async () => {
        const multiplier = parseFloat(multiplierInput);
        if (isNaN(multiplier) || multiplier <= 0) return;
        try {
            await setTime({ speedMultiplier: multiplier });
            setMultiplierInput('');
        } catch (err) {
            console.error('Failed to set multiplier:', err);
        }
    };

    return (
        <div className="simulation-time-panel">
            <div className="panel-header">
                <MaterialIcon icon="schedule" size="S" />
                <h3 className="panel-title">Simulation Time</h3>
                <div className="time-display">
                    {formatDateTime(displayData?.simulatedUtcNow || '', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                <span className="speed-display">×{displayData?.speedMultiplier ?? 1}</span>
            </div>

            <div className="panel-body">
                {/* Set Date/Time */}
                <div className="control-section">
                    <input
                        type="datetime-local"
                        value={dateTimeInput}
                        onChange={(e) => setDateTimeInput(e.target.value)}
                        className="time-input"
                        disabled={settingTime}
                        placeholder="Set date & time"
                    />
                    <Button 
                        variant="primary" 
                        onClick={handleSetDateTime}
                        disabled={!dateTimeInput || settingTime}
                    >
                        Set
                    </Button>
                </div>

                {/* Speed Multiplier */}
                <div className="control-section">
                    <input
                        type="number"
                        value={multiplierInput}
                        onChange={(e) => setMultiplierInput(e.target.value)}
                        placeholder="Speed multiplier"
                        className="multiplier-input"
                        min="0.1"
                        step="0.1"
                        disabled={settingTime}
                    />
                    <Button 
                        variant="primary" 
                        onClick={handleSetMultiplier}
                        disabled={!multiplierInput || settingTime}
                    >
                        Set
                    </Button>
                </div>
            </div>
        </div>
    );
}