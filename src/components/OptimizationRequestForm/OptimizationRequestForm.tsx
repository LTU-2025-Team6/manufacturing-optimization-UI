import { useState, useEffect } from 'react';
import { IOptimizationRequest } from '../../types/IOptimizationRequest';
import { generateRandomRequest } from '../../utils/requestGenerator';
import Button from '../Button/Button';

function toInputDateTime(value: string) {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromInputDateTime(value: string): string {
    if (!value) return '';
    // datetime-local возвращает "YYYY-MM-DDTHH:mm" в локальном времени
    // Нужно явно указать, что это локальное время, а не UTC
    // Добавляем секунды для полного формата
    const localDateString = value.length === 16 ? value + ':00' : value;
    const date = new Date(localDateString);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', value);
        return '';
    }
    
    return date.toISOString();
}

function createEmptyRequest(): IOptimizationRequest {
    return {
        customerId: '',
        motorSpecs: {
            powerKW: 0,
            axisHeightMM: 0,
            currentEfficiency: 'IE1',
            targetEfficiency: 'IE3',
            malfunctionDescription: ''
        },
        constraints: {
            maxBudget: undefined,
            timeWindow: {
                startTime: '',
                endTime: ''
            }
        },
        createdAt: new Date().toISOString()
    };
}

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
        <>
            <Button type="button" onClick={handleAutoFill} style={{ marginBottom: 12 }}>
                Autofill Random Data
            </Button>

            <table border={1}>
                <tbody>
                    <tr>
                        <td>Customer ID</td>
                        <td>
                            <input
                                type="text"
                                value={localRequest.customerId}
                                onChange={e => handleChange('customerId', e.target.value)}
                                placeholder="Enter customer ID or use autofill"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Power (kW)</td>
                        <td>
                            <input
                                type="number"
                                value={localRequest.motorSpecs.powerKW || ''}
                                onChange={e => handleChange('motorSpecs.powerKW', Number(e.target.value))}
                                min="0"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Axis Height (mm)</td>
                        <td>
                            <input
                                type="number"
                                value={localRequest.motorSpecs.axisHeightMM || ''}
                                onChange={e => handleChange('motorSpecs.axisHeightMM', Number(e.target.value))}
                                min="0"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Current Efficiency</td>
                        <td>
                            <select
                                value={localRequest.motorSpecs.currentEfficiency}
                                onChange={e => handleChange('motorSpecs.currentEfficiency', e.target.value)}
                            >
                                {EFFICIENCY_CLASSES.map(ec => (
                                    <option key={ec} value={ec}>{ec}</option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Target Efficiency</td>
                        <td>
                            <select
                                value={localRequest.motorSpecs.targetEfficiency}
                                onChange={e => handleChange('motorSpecs.targetEfficiency', e.target.value)}
                            >
                                {EFFICIENCY_CLASSES.map(ec => (
                                    <option key={ec} value={ec}>{ec}</option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Malfunction</td>
                        <td>
                            <input
                                type="text"
                                value={localRequest.motorSpecs.malfunctionDescription || ''}
                                onChange={e => handleChange('motorSpecs.malfunctionDescription', e.target.value)}
                                placeholder="Optional"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Max Budget (€)</td>
                        <td>
                            <input
                                type="number"
                                value={localRequest.constraints.maxBudget ?? ''}
                                onChange={e => handleChange('constraints.maxBudget', e.target.value)}
                                placeholder="No limit"
                                min="0"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Time Window Start</td>
                        <td>
                            <input
                                type="datetime-local"
                                value={toInputDateTime(localRequest.constraints.timeWindow.startTime)}
                                onChange={e => handleChange('constraints.timeWindow.startTime', fromInputDateTime(e.target.value))}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Time Window End</td>
                        <td>
                            <input
                                type="datetime-local"
                                value={toInputDateTime(localRequest.constraints.timeWindow.endTime)}
                                onChange={e => handleChange('constraints.timeWindow.endTime', fromInputDateTime(e.target.value))}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}
