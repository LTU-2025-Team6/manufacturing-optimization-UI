import { ReactElement, useState } from 'react';
import { IProcessCapability } from '../../types/IProcessCapability';
import { ProcessType, ProcessTypeLabels, ProcessTypeDescriptions } from '../../types/ProcessType';
import Button from '../Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Collapsible from '../Collapsible/Collapsible';
import './ProcessCapabilitiesEditor.css';

interface ProcessCapabilitiesEditorProps {
    capabilities: IProcessCapability[];
    onChange: (capabilities: IProcessCapability[]) => void;
}

const ProcessCapabilitiesEditor = ({ capabilities, onChange }: ProcessCapabilitiesEditorProps): ReactElement => {
    const [selectedProcess, setSelectedProcess] = useState<ProcessType | ''>('');

    const updateCapability = (index: number, field: keyof IProcessCapability, value: any) => {
        const updated = [...capabilities];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const addCapability = () => {
        if (!selectedProcess) return;

        const newCapability: IProcessCapability = {
            id: crypto.randomUUID(),
            process: selectedProcess,
            costPerHour: 50,
            speedMultiplier: 1.0,
            qualityScore: 0.8,
            energyConsumptionKwhPerHour: 10,
            carbonIntensityKgCO2PerKwh: 0.5,
            usesRenewableEnergy: false
        };

        onChange([...capabilities, newCapability]);
        setSelectedProcess('');
    };
    const removeCapability = (index: number) => {
        const updated = capabilities.filter((_, i) => i !== index);
        onChange(updated);
    };

    const availableProcesses = Object.values(ProcessType).filter(
        processType => !capabilities.some(cap => cap.process === processType)
    );

    return (
        <div className="process-capabilities-editor">
            <div className="add-process-section">
                <h4>Add New Process</h4>
                <div className="add-process-form">
                    <select 
                        value={selectedProcess} 
                        onChange={(e) => setSelectedProcess(e.target.value as ProcessType)}
                        className="form-select"
                        disabled={availableProcesses.length === 0}
                    >
                        <option value="">Select a process...</option>
                        {availableProcesses.map(processType => (
                            <option key={processType} value={processType}>
                                {ProcessTypeLabels[processType]} - {ProcessTypeDescriptions[processType]}
                            </option>
                        ))}
                    </select>
                    <Button 
                        onClick={addCapability} 
                        disabled={!selectedProcess}
                        variant="primary"
                    >
                        <MaterialIcon icon="add" /> Add
                    </Button>
                </div>
                {availableProcesses.length === 0 && (
                    <p className="info-text">All available processes have been added.</p>
                )}
            </div>

            <div className="process-capabilities-list">
                {capabilities.map((cap, index) => (
                    <div key={cap.id}>
                        <Collapsible title={ProcessTypeLabels[cap.process as ProcessType] || cap.process} defaultOpen={false}>
                            <div className="process-capability-item">
                                <div className="process-header">
                                    <div>
                                        <p className="process-description">
                                            {ProcessTypeDescriptions[cap.process as ProcessType]}
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => removeCapability(index)}
                                        variant="secondary"
                                    >
                                        <MaterialIcon icon="delete" /> Remove
                                    </Button>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cost Per Hour (€)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={cap.costPerHour}
                                            onChange={(e) => updateCapability(index, 'costPerHour', Number(e.target.value))}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Speed Multiplier</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={cap.speedMultiplier}
                                            onChange={(e) => updateCapability(index, 'speedMultiplier', Number(e.target.value))}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Quality Score (0-1)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={cap.qualityScore}
                                            onChange={(e) => updateCapability(index, 'qualityScore', Number(e.target.value))}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Energy Consumption (kWh/h)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={cap.energyConsumptionKwhPerHour}
                                            onChange={(e) => updateCapability(index, 'energyConsumptionKwhPerHour', Number(e.target.value))}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Carbon Intensity (kg CO2/kWh)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={cap.carbonIntensityKgCO2PerKwh}
                                            onChange={(e) => updateCapability(index, 'carbonIntensityKgCO2PerKwh', Number(e.target.value))}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="checkbox-label-inline">
                                            <input 
                                                type="checkbox" 
                                                checked={cap.usesRenewableEnergy}
                                                onChange={(e) => updateCapability(index, 'usesRenewableEnergy', e.target.checked)}
                                            />
                                            {' '}Uses Renewable Energy
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Collapsible>
                    </div>
                ))}
            </div>

            {capabilities.length === 0 && (
                <div className="empty-state">
                    <p>No process capabilities configured. Add one to get started.</p>
                </div>
            )}
        </div>
    );
};

export default ProcessCapabilitiesEditor;
