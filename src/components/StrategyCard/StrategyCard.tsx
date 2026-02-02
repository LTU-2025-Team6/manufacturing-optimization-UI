import { IOptimizationStrategy } from '../../types/IOptimizationStrategy';
import { parseDuration } from '../../utils/durationParser';
import Collapsible from '../Collapsible/Collapsible';
import Timeline from '../Timeline/Timeline';
import Card from '../Card/Card';
import './StrategyCard.css';

interface StrategyCardProps {
    strategy: IOptimizationStrategy;
}

export default function StrategyCard({ strategy }: StrategyCardProps) {
    return (
        <div className="strategy-card">
            {/* Header with key metrics */}
            <div className="strategy-header">
                <div>
                    <h2>{strategy.strategyName}</h2>
                    <p>{strategy.description}</p>
                </div>
                <div className="strategy-metrics-summary">
                    <div className="metric">
                        <span className="metric-label">Total Cost</span>
                        <span className="metric-value">€{strategy.metrics.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Duration</span>
                        <span className="metric-value">{parseDuration(strategy.metrics.totalDuration)}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Quality</span>
                        <span className="metric-value">{(strategy.metrics.averageQuality * 100).toFixed(0)}%</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">CO₂</span>
                        <span className="metric-value">{strategy.metrics.totalEmissionsKgCO2.toFixed(1)} kg</span>
                    </div>
                </div>
            </div>

            {/* Collapsible sections */}
            <div className="strategy-sections">
                <Collapsible title="Timeline & Scheduling" defaultOpen={true}>
                    <Timeline steps={strategy.steps} />
                </Collapsible>

                <Collapsible title={`Process Steps (${strategy.steps.length})`} defaultOpen={false}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Process</th>
                                <th>Provider</th>
                                <th>Cost</th>
                                <th>Quality</th>
                                <th>CO₂</th>
                                <th>Scheduled Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strategy.steps.sort((a, b) => a.stepNumber - b.stepNumber).map(step => (
                                <tr key={step.id}>
                                    <td>{step.stepNumber}</td>
                                    <td><strong>{step.process}</strong></td>
                                    <td>{step.selectedProviderName}</td>
                                    <td>€{step.estimate.cost.toFixed(2)}</td>
                                    <td>{(step.estimate.qualityScore * 100).toFixed(0)}%</td>
                                    <td>{step.estimate.emissionsKgCO2.toFixed(2)} kg</td>
                                    <td>
                                        {step.allocatedSchedule ? (
                                            <small>{new Date(step.allocatedSchedule.startTime).toLocaleString()}</small>
                                        ) : (
                                            <span className="text-muted">Not scheduled</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Collapsible>

                <Collapsible title="Optimization Metrics" defaultOpen={false}>
                    <div className="metrics-grid">
                        <Card title="Cost Breakdown">
                            <p><strong>Total Cost:</strong> €{strategy.metrics.totalCost.toFixed(2)}</p>
                            <p><strong>Average per Step:</strong> €{(strategy.metrics.totalCost / strategy.steps.length).toFixed(2)}</p>
                        </Card>
                        <Card title="Performance">
                            <p><strong>Total Duration:</strong> {parseDuration(strategy.metrics.totalDuration)}</p>
                            <p><strong>Average Quality:</strong> {(strategy.metrics.averageQuality * 100).toFixed(1)}%</p>
                            <p><strong>Solver Status:</strong> {strategy.metrics.solverStatus || 'N/A'}</p>
                            <p><strong>Objective Value:</strong> {strategy.metrics.objectiveValue.toFixed(6)}</p>
                        </Card>
                        <Card title="Environmental Impact">
                            <p><strong>Total Emissions:</strong> {strategy.metrics.totalEmissionsKgCO2.toFixed(2)} kg CO₂</p>
                            <p><strong>Per Step Average:</strong> {(strategy.metrics.totalEmissionsKgCO2 / strategy.steps.length).toFixed(2)} kg CO₂</p>
                        </Card>
                    </div>
                </Collapsible>

                <Collapsible title="Warranty & Support" defaultOpen={false}>
                    {strategy.warranty ? (
                        <>
                            <p><strong>Level:</strong> {strategy.warranty.level}</p>
                            <p><strong>Duration:</strong> {strategy.warranty.durationMonths} months</p>
                            <p><strong>Insurance Included:</strong> {strategy.warranty.includesInsurance ? 'Yes' : 'No'}</p>
                            <p><strong>Description:</strong> {strategy.warranty.description}</p>
                        </>
                    ) : (
                        <p className="text-muted">No warranty information available</p>
                    )}
                </Collapsible>

                <Collapsible title="Strategy Details" defaultOpen={false}>
                    <table>
                        <tbody>
                            <tr><td>Strategy ID</td><td>{strategy.id}</td></tr>
                            <tr><td>Priority</td><td>{strategy.priority}</td></tr>
                            <tr><td>Workflow Type</td><td>{strategy.workflowType}</td></tr>
                            <tr><td>Number of Steps</td><td>{strategy.steps.length}</td></tr>
                        </tbody>
                    </table>
                </Collapsible>
            </div>
        </div>
    );
}
