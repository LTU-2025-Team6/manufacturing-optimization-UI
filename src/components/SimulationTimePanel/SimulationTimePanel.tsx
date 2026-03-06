import { useState, useRef, useEffect } from 'react';
import { useSimulationTimePolling, useSetSimulationTime } from '../../hooks/api/simulationTimeApi';
import { formatDateTimeUtc, ensureUtc } from '../../utils/dateTimeUtils';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './SimulationTimePanel.css';

const SPEED_PRESETS = [1, 500, 1000, 5000, 10000];

function localInputAsUtc(value: string): string {
    const s = value.length === 16 ? value + ':00' : value;
    return s + 'Z';
}

function utcToLocalInput(isoString: string): string {
    if (!isoString) return '';
    const d = new Date(ensureUtc(isoString));
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export default function SimulationTimePanel() {
    const { data: timeData } = useSimulationTimePolling(2000);
    const { callApi: setTime, loading: settingTime } = useSetSimulationTime();

    const lastValidDataRef = useRef(timeData);
    useEffect(() => { if (timeData) lastValidDataRef.current = timeData; }, [timeData]);
    const displayData = timeData || lastValidDataRef.current;

    const [dateTimeInput, setDateTimeInput] = useState('');
    const [selectedSpeed, setSelectedSpeed] = useState<number | null>(null);

    const currentSpeed = displayData?.speedMultiplier ?? 1;
    const activeSpeed = selectedSpeed ?? currentSpeed;

    const handleSet = async () => {
        const payload: { simulatedUtcNow?: string; speedMultiplier?: number } = {};
        if (dateTimeInput) payload.simulatedUtcNow = localInputAsUtc(dateTimeInput);
        if (selectedSpeed !== null && selectedSpeed !== currentSpeed) payload.speedMultiplier = selectedSpeed;
        if (!payload.simulatedUtcNow && payload.speedMultiplier === undefined) return;
        try {
            await setTime(payload);
            setDateTimeInput('');
            setSelectedSpeed(null);
        } catch (err) {
            console.error('Failed to set simulation time:', err);
        }
    };

    const hasChanges = !!dateTimeInput || (selectedSpeed !== null && selectedSpeed !== currentSpeed);

    return (
        <div className="sim-panel">
            <div className="sim-panel-status">
                <MaterialIcon icon="schedule" size="S" />
                <span className="sim-panel-time">
                    {formatDateTimeUtc(displayData?.simulatedUtcNow || '', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })} UTC
                </span>
                <span className="sim-panel-speed">×{currentSpeed}</span>
            </div>

            <div className="sim-panel-divider" />

            <input
                type="datetime-local"
                className="sim-panel-dt-input"
                value={dateTimeInput}
                onChange={e => setDateTimeInput(e.target.value)}
                placeholder={displayData?.simulatedUtcNow ? utcToLocalInput(displayData.simulatedUtcNow) : 'Set time…'}
                disabled={settingTime}
                title="Enter time in UTC"
            />

            <div className="sim-panel-speeds">
                {SPEED_PRESETS.map(speed => (
                    <button
                        key={speed}
                        className={`sim-speed-btn ${activeSpeed === speed ? 'active' : ''}`}
                        onClick={() => setSelectedSpeed(speed === currentSpeed && selectedSpeed === null ? null : speed)}
                        disabled={settingTime}
                        title={`Set speed ×${speed}`}
                    >
                        ×{speed >= 1000 ? `${speed / 1000}k` : speed}
                    </button>
                ))}
            </div>

            <button
                className={`sim-panel-set-btn ${hasChanges ? 'ready' : ''}`}
                onClick={handleSet}
                disabled={!hasChanges || settingTime}
                title="Apply changes"
            >
                {settingTime ? <MaterialIcon icon="hourglass_empty" size="S" /> : 'Set'}
            </button>
        </div>
    );
}
