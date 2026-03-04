import { useState, useEffect } from 'react';
import { IOptimizationRequest } from '../../types';
import { generateRandomRequest } from '../../utils/requestGenerator';
import { toLocalDateTimeInput, fromLocalDateTimeInput } from '../../utils/dateTimeUtils';
import Button from '../Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './OptimizationRequestForm.css';

const EFFICIENCY_CLASSES = ['IE1', 'IE2', 'IE3', 'IE4', 'IE5'];

interface Props {
    request: IOptimizationRequest;
    onChange?: (request: IOptimizationRequest) => void;
}

export default function OptimizationRequestForm({ request, onChange }: Props) {
    const [localRequest, setLocalRequest] = useState<IOptimizationRequest>(request);

    useEffect(() => {
        setLocalRequest(request);
    }, [request]);

    useEffect(() => {
        if (onChange) {
            onChange(localRequest);
        }
    }, [localRequest]);

    const handleChange = (field: string, value: any) => {
        let updated = { ...localRequest };
        if (field.startsWith('motorSpecs.')) {
            updated.motorSpecs = { ...updated.motorSpecs, [field.split('.')[1]]: value };
        } else if (field.startsWith('constraints.')) {
            if (field === 'constraints.maxBudget') {
                updated.constraints = { ...updated.constraints, maxBudget: value === '' ? undefined : Number(value) };
            } else if (field.startsWith('constraints.timeWindow.')) {
                updated.constraints = {
                    ...updated.constraints,
                    timeWindow: {
                        ...updated.constraints.timeWindow,
                        [field.split('.')[2]]: value
                    }
                };
            }
        } else {
            updated = { ...updated, [field]: value };
        }
        setLocalRequest(updated);
    };

    const handleAutoFill = () => {
        const auto = generateRandomRequest();
        setLocalRequest(auto);
    };

    return (
        <div className="optimization-request-form">
            <div className="form-header">
                <h2>Optimization Request</h2>
                <Button type="button" onClick={handleAutoFill} variant="secondary">
                    <MaterialIcon icon="auto_fix_high" size="S" />
                    Autofill Random Data
                </Button>
            </div>

            <div className="form-sections">
                {/* Customer Information Section */}
                <div className="form-section customer-id-section">
                    <div className="section-header">
                        <MaterialIcon icon="person" size="M" />
                        <h3>Customer Information</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group form-group-full">
                            <label className="required">Customer ID</label>
                            <input
                                type="text"
                                value={localRequest.customerId}
                                onChange={e => handleChange('customerId', e.target.value)}
                                placeholder="Enter customer ID or use autofill"
                            />
                        </div>
                    </div>
                </div>

                {/* Motor Specifications Section */}
                <div className="form-section">
                    <div className="section-header">
                        <MaterialIcon icon="settings" size="M" />
                        <h3>Motor Specifications</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="required">
                                <MaterialIcon icon="bolt" size="S" />
                                Power (kW)
                            </label>
                            <input
                                type="number"
                                value={localRequest.motorSpecs.powerKW || ''}
                                onChange={e => handleChange('motorSpecs.powerKW', Number(e.target.value))}
                                min="0"
                                step="0.1"
                                placeholder="e.g. 15.5"
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">
                                <MaterialIcon icon="straighten" size="S" />
                                Axis Height (mm)
                            </label>
                            <input
                                type="number"
                                value={localRequest.motorSpecs.axisHeightMM || ''}
                                onChange={e => handleChange('motorSpecs.axisHeightMM', Number(e.target.value))}
                                min="0"
                                placeholder="e.g. 132"
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">
                                <MaterialIcon icon="trending_down" size="S" />
                                Current Efficiency
                            </label>
                            <select
                                value={localRequest.motorSpecs.currentEfficiency}
                                onChange={e => handleChange('motorSpecs.currentEfficiency', e.target.value)}
                            >
                                {EFFICIENCY_CLASSES.map(ec => (
                                    <option key={ec} value={ec}>{ec}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="required">
                                <MaterialIcon icon="trending_up" size="S" />
                                Target Efficiency
                            </label>
                            <select
                                value={localRequest.motorSpecs.targetEfficiency}
                                onChange={e => handleChange('motorSpecs.targetEfficiency', e.target.value)}
                            >
                                {EFFICIENCY_CLASSES.map(ec => (
                                    <option key={ec} value={ec}>{ec}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group form-group-full">
                            <label>
                                <MaterialIcon icon="build" size="S" />
                                Malfunction Description
                            </label>
                            <input
                                type="text"
                                value={localRequest.motorSpecs.malfunctionDescription || ''}
                                onChange={e => handleChange('motorSpecs.malfunctionDescription', e.target.value)}
                                placeholder="Optional: Describe any issues with the motor"
                            />
                            <span className="form-helper-text">Optional field for additional context</span>
                        </div>
                    </div>
                </div>

                {/* Constraints Section */}
                <div className="form-section">
                    <div className="section-header">
                        <MaterialIcon icon="tune" size="M" />
                        <h3>Constraints</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>
                                <MaterialIcon icon="euro" size="S" />
                                Maximum Budget (€)
                            </label>
                            <input
                                type="number"
                                value={localRequest.constraints.maxBudget ?? ''}
                                onChange={e => handleChange('constraints.maxBudget', e.target.value)}
                                placeholder="No limit"
                                min="0"
                                step="1"
                            />
                            <span className="form-helper-text">Leave empty for no budget constraint</span>
                        </div>

                        <div className="form-group">
                            <label className="required">
                                <MaterialIcon icon="event" size="S" />
                                Time Window Start
                            </label>
                            <input
                                type="datetime-local"
                                value={toLocalDateTimeInput(localRequest.constraints.timeWindow.startTime)}
                                onChange={e => handleChange('constraints.timeWindow.startTime', fromLocalDateTimeInput(e.target.value))}
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">
                                <MaterialIcon icon="event_available" size="S" />
                                Time Window End
                            </label>
                            <input
                                type="datetime-local"
                                value={toLocalDateTimeInput(localRequest.constraints.timeWindow.endTime)}
                                onChange={e => handleChange('constraints.timeWindow.endTime', fromLocalDateTimeInput(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
