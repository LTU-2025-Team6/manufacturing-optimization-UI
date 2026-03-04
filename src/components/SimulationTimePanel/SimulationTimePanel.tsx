import { useState, useRef, useEffect } from 'react';
import { useSimulationTimePolling, useSetSimulationTime } from '../../hooks/api/simulationTimeApi';
import { formatDateTimeUtc, ensureUtc } from '../../utils/dateTimeUtils';
import Button from '../Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './SimulationTimePanel.css';

/** Convert datetime-local input value to UTC ISO string WITHOUT local timezone offset.
 *  The input is treated as if the user typed a UTC time directly. */
function localInputAsUtc(value: string): string {
    // datetime-local gives "YYYY-MM-DDTHH:mm" — treat it as UTC by appending Z
    const s = value.length === 16 ? value + ':00' : value;
    return s + 'Z';
}

/** Format a UTC ISO string for use in a datetime-local input (shown as UTC to the user). */
function utcToLocalInput(isoString: string): string {
    if (!isoString) return '';
    const utc = ensureUtc(isoString);
    const d = new Date(utc);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

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
            // Input is shown/entered in UTC — treat value directly as UTC (no local offset)
            const utcDate = localInputAsUtc(dateTimeInput);
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
                    {formatDateTimeUtc(displayData?.simulatedUtcNow || '', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })} UTC
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
                        placeholder={displayData?.simulatedUtcNow ? utcToLocalInput(displayData.simulatedUtcNow) : ''}
                        className="time-input"
                        disabled={settingTime}
                    />
                    <Button 
                        variant="secondary" 
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
                        variant="secondary" 
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