import { IProvider } from '../../types';
import Card from '../Card/Card';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import ProviderScheduleView from '../ProviderScheduleView/ProviderScheduleView';
import StatusBadge from '../StatusBadge/StatusBadge';
import Tabs from '../Tabs/Tabs';
import './ProviderDetails.css';

interface ProviderDetailsProps {
    provider: IProvider;
}

export default function ProviderDetails({ provider }: ProviderDetailsProps) {
    return (
        <div className="provider-details">
            <Tabs
                tabs={[
                    {
                        key: 'details',
                        label: 'Details',
                        content: (
                            <div className="provider-details-main">
                                <div className="provider-details-header">
                                    <h2>{provider.name}</h2>
                                    <div className="provider-details-meta">
                                        <div className="provider-meta-item">
                                            <span className="provider-meta-label">ID:</span>
                                            <span className="provider-meta-value">{provider.id}</span>
                                        </div>
                                        <div className="provider-meta-item">
                                            <span className="provider-meta-label">Type:</span>
                                            <span className="provider-meta-value">{provider.type}</span>
                                        </div>
                                        <div className="provider-meta-item">
                                            <span className="provider-meta-label">Status:</span>
                                            <StatusBadge 
                                                status={provider.isRunning ? 'Active' : 'Offline'} 
                                                variant={provider.isRunning ? 'success' : 'offline'} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Card title="Technical Capabilities">
                                    <div className="provider-info-grid">
                                        <div className="provider-info-item">
                                            <div className="provider-info-item-label">Axis Height</div>
                                            <div className="provider-info-item-value">{provider.technicalCapabilities.axisHeight} mm</div>
                                        </div>
                                        <div className="provider-info-item">
                                            <div className="provider-info-item-label">Power</div>
                                            <div className="provider-info-item-value">{provider.technicalCapabilities.power} kW</div>
                                        </div>
                                        <div className="provider-info-item">
                                            <div className="provider-info-item-label">Tolerance</div>
                                            <div className="provider-info-item-value">{provider.technicalCapabilities.tolerance}</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card title={`Process Capabilities (${provider.processCapabilities.length})`}>
                                    {provider.processCapabilities.length === 0 ? (
                                        <div className="provider-empty-state">No process capabilities available</div>
                                    ) : (
                                        <table className="provider-data-table">
                                            <thead>
                                                <tr>
                                                    <th>Process</th>
                                                    <th>Cost/Hour</th>
                                                    <th>Speed</th>
                                                    <th>Quality</th>
                                                    <th>Energy</th>
                                                    <th>Carbon</th>
                                                    <th>Renewable</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {provider.processCapabilities.map(cap => (
                                                    <tr key={cap.id}>
                                                        <td><strong>{cap.process}</strong></td>
                                                        <td>€{cap.costPerHour.toFixed(2)}/h</td>
                                                        <td>{cap.speedMultiplier}x</td>
                                                        <td>{(cap.qualityScore * 100).toFixed(0)}%</td>
                                                        <td>{cap.energyConsumptionKwhPerHour.toFixed(1)} kWh/h</td>
                                                        <td>{cap.carbonIntensityKgCO2PerKwh.toFixed(2)} kg/kWh</td>
                                                        <td>
                                                            <span className={`provider-status-icon ${cap.usesRenewableEnergy ? 'success' : 'muted'}`}>
                                                                <MaterialIcon icon={cap.usesRenewableEnergy ? 'check_circle' : 'cancel'} size="S" />
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </Card>

                                <Card title="Environmental Impact">
                                    <div className="provider-stats">
                                        <div className="provider-stat-card">
                                            <div className="provider-stat-label">Renewable Energy Usage</div>
                                            <div className="provider-stat-value">
                                                {provider.processCapabilities.filter(c => c.usesRenewableEnergy).length} / {provider.processCapabilities.length}
                                            </div>
                                        </div>
                                        <div className="provider-stat-card">
                                            <div className="provider-stat-label">Average Quality Score</div>
                                            <div className="provider-stat-value">
                                                {provider.processCapabilities.length > 0
                                                    ? (provider.processCapabilities.reduce((acc, c) => acc + c.qualityScore, 0) / provider.processCapabilities.length * 100).toFixed(1)
                                                    : 'N/A'}%
                                            </div>
                                        </div>
                                        <div className="provider-stat-card">
                                            <div className="provider-stat-label">Average Cost</div>
                                            <div className="provider-stat-value">
                                                €{provider.processCapabilities.length > 0
                                                    ? (provider.processCapabilities.reduce((acc, c) => acc + c.costPerHour, 0) / provider.processCapabilities.length).toFixed(2)
                                                    : '0.00'}/h
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Working Hours">
                                    <div className="provider-info-grid">
                                        <div className="provider-info-item">
                                            <div className="provider-info-item-label">Working Days</div>
                                            <div className="provider-info-item-value">
                                                {provider.workingHours.is24x7 ? '24×7' : provider.workingHours.workingDays.join(', ')}
                                            </div>
                                        </div>
                                        {!provider.workingHours.is24x7 && (
                                            <div className="provider-info-item">
                                                <div className="provider-info-item-label">Daily Hours</div>
                                                <div className="provider-info-item-value">
                                                    {provider.workingHours.workDayStartHour}:00 - {provider.workingHours.workDayEndHour}:00
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {provider.workingHours.breaks.length > 0 && (
                                        <div style={{ marginTop: 'var(--ds-space-4)' }}>
                                            <div className="provider-info-item-label" style={{ marginBottom: 'var(--ds-space-2)' }}>Break Periods</div>
                                            <ul className="provider-break-list">
                                                {provider.workingHours.breaks.map((brk, index) => (
                                                    <li key={index} className="provider-break-item">
                                                        <MaterialIcon icon="schedule" size="S" />
                                                        <span className="provider-break-name">{brk.name}:</span>
                                                        <span className="provider-break-time">
                                                            {brk.startHour}:{brk.startMinute.toString().padStart(2, '0')} for {brk.durationMinutes} minutes
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )
                    },
                    {
                        key: 'schedule',
                        label: 'Schedule',
                        content: <ProviderScheduleView providerId={provider.id} />
                    }
                ]}
            />
        </div>
    );
}
