import { IProvider } from '../../types/IProvider';
import Card from '../Card/Card';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import ProviderScheduleView from '../ProviderScheduleView/ProviderScheduleView';
import Tabs from '../Tabs/Tabs';

interface ProviderDetailsProps {
    provider: IProvider;
}

export default function ProviderDetails({ provider }: ProviderDetailsProps) {
    return (
        <Tabs
            tabs={[
                {
                    key: 'details',
                    label: 'Details',
                    content: (
                        <div>
                            <h2>{provider.name}</h2>
                            <p><strong>ID:</strong> {provider.id}</p>
                            <p><strong>Type:</strong> {provider.type}</p>
                            <p><strong>Status:</strong> <span className={provider.isRunning ? 'status-success' : 'status-error'}>
                                {provider.isRunning ? 'Active' : 'Inactive'}
                            </span></p>

                            <Card title="Technical Capabilities">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Axis Height</td>
                                            <td>{provider.technicalCapabilities.axisHeight} mm</td>
                                        </tr>
                                        <tr>
                                            <td>Power</td>
                                            <td>{provider.technicalCapabilities.power} kW</td>
                                        </tr>
                                        <tr>
                                            <td>Tolerance</td>
                                            <td>{provider.technicalCapabilities.tolerance}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Card>

                            <Card title={`Process Capabilities (${provider.processCapabilities.length})`}>
                                {provider.processCapabilities.length === 0 ? (
                                    <p>No process capabilities available</p>
                                ) : (
                                    <table>
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
                                                    <td className={cap.usesRenewableEnergy ? 'status-success' : 'status-muted'}>
                                                        {cap.usesRenewableEnergy ? <MaterialIcon icon="check" /> : <MaterialIcon icon="close" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </Card>

                            <Card title="Environmental Impact">
                                <p><strong>Renewable Energy Usage:</strong> {
                                    provider.processCapabilities.filter(c => c.usesRenewableEnergy).length
                                } / {provider.processCapabilities.length} processes</p>
                                <p><strong>Average Quality Score:</strong> {
                                    provider.processCapabilities.length > 0
                                        ? (provider.processCapabilities.reduce((acc, c) => acc + c.qualityScore, 0) / provider.processCapabilities.length * 100).toFixed(1)
                                        : 'N/A'
                                }%</p>
                                <p><strong>Average Cost:</strong> €{
                                    provider.processCapabilities.length > 0
                                        ? (provider.processCapabilities.reduce((acc, c) => acc + c.costPerHour, 0) / provider.processCapabilities.length).toFixed(2)
                                        : '0.00'
                                }/hour</p>
                            </Card>

                            <Card title="Working Hours">
                                <p><strong>Working Days:</strong> {provider.workingHours.is24x7 ? '24x7' : provider.workingHours.workingDays.join(', ')}</p>
                                {!provider.workingHours.is24x7 && (
                                    <p><strong>Daily Hours:</strong> {provider.workingHours.workDayStartHour}:00 - {provider.workingHours.workDayEndHour}:00</p>
                                )}
                                {provider.workingHours.breaks.length > 0 && (
                                    <div>
                                        <strong>Break Periods:</strong>
                                        <ul>
                                            {provider.workingHours.breaks.map((brk, index) => (
                                                <li key={index}>
                                                    <b>{brk.name}</b>: {brk.startHour}:{brk.startMinute.toString().padStart(2, '0')} for {brk.durationMinutes} minutes
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
    );
}
