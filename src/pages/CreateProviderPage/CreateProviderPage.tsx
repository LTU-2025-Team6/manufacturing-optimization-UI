import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProvider } from '../../hooks/api/providerApi';
import { 
    ICreateProviderRequest,
    ICreateProcessCapabilityRequest,
    ICreateTechnicalCapabilitiesRequest,
    ICreateWorkingHoursRequest,
    ICreateBreakPeriodRequest,
    IProcessCapability,
    IProviderBreakPeriod
} from '../../types';
import Alert from '../../components/Alert/Alert';
import ProcessCapabilitiesEditor from '../../components/ProcessCapabilitiesEditor/ProcessCapabilitiesEditor';
import BreakPeriodsEditor from '../../components/BreakPeriodsEditor/BreakPeriodsEditor';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import './CreateProviderPage.css';

const PROVIDER_TYPES = ['CNC', '3DPrinter', 'LaserCutter', 'InjectionMolder'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CreateProviderPage(): ReactElement {
    const navigate = useNavigate();
    const { loading, error, callApi } = useCreateProvider();

    const [formData, setFormData] = useState({
        type: PROVIDER_TYPES[0],
        name: '',
        autoStart: true,
    });

    const [processCapabilities, setProcessCapabilities] = useState<IProcessCapability[]>([]);
    
    const [technicalCapabilities, setTechnicalCapabilities] = useState({
        axisHeight: 100,
        power: 5000,
        tolerance: 0.01
    });

    const [workingHours, setWorkingHours] = useState({
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workDayStartHour: 8,
        workDayEndHour: 18,
        is24x7: false
    });

    const [breaks, setBreaks] = useState<IProviderBreakPeriod[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const processCapabilitiesRequest: ICreateProcessCapabilityRequest[] = processCapabilities.map(cap => ({
            process: cap.process,
            costPerHour: cap.costPerHour,
            speedMultiplier: cap.speedMultiplier,
            qualityScore: cap.qualityScore,
            energyConsumptionKwhPerHour: cap.energyConsumptionKwhPerHour,
            carbonIntensityKgCO2PerKwh: cap.carbonIntensityKgCO2PerKwh,
            usesRenewableEnergy: cap.usesRenewableEnergy
        }));

        const technicalCapabilitiesRequest: ICreateTechnicalCapabilitiesRequest = {
            axisHeight: technicalCapabilities.axisHeight,
            power: technicalCapabilities.power,
            tolerance: technicalCapabilities.tolerance
        };

        const breaksRequest: ICreateBreakPeriodRequest[] = breaks.map(b => ({
            startHour: b.startHour,
            startMinute: b.startMinute,
            durationMinutes: b.durationMinutes,
            name: b.name
        }));

        const workingHoursRequest: ICreateWorkingHoursRequest = {
            workingDays: workingHours.workingDays,
            workDayStartHour: workingHours.workDayStartHour,
            workDayEndHour: workingHours.workDayEndHour,
            is24x7: workingHours.is24x7,
            breaks: breaksRequest
        };

        const request: ICreateProviderRequest = {
            type: formData.type,
            name: formData.name,
            autoStart: formData.autoStart,
            processCapabilities: processCapabilitiesRequest,
            technicalCapabilities: technicalCapabilitiesRequest,
            workingHours: workingHoursRequest
        };

        try {
            const createdProvider = await callApi(request);
            if (createdProvider) {
                navigate(`/providers/${createdProvider.id}`);
            }
        } catch (err) {
            console.error('Failed to create provider:', err);
        }
    };

    const updateFormField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateTechnicalCapability = (field: string, value: number) => {
        setTechnicalCapabilities({ ...technicalCapabilities, [field]: value });
    };

    const updateWorkingHoursField = (field: string, value: any) => {
        setWorkingHours({ ...workingHours, [field]: value });
    };

    const toggleWorkingDay = (day: string) => {
        const newDays = workingHours.workingDays.includes(day)
            ? workingHours.workingDays.filter(d => d !== day)
            : [...workingHours.workingDays, day];
        setWorkingHours({ ...workingHours, workingDays: newDays });
    };

    const handleProcessCapabilitiesChange = (capabilities: IProcessCapability[]) => {
        setProcessCapabilities(capabilities);
    };

    const handleBreaksChange = (updatedBreaks: IProviderBreakPeriod[]) => {
        setBreaks(updatedBreaks);
    };

    return (
        <div className="create-provider-page">
            <div className="create-provider-header">
                <div className="header-title-wrapper">
                    <button 
                        type="button"
                        className="header-back-btn"
                        onClick={() => navigate('/providers')}
                        title="Back to providers"
                    >
                        <MaterialIcon icon="arrow_back" size="M" />
                    </button>
                    <div>
                        <h1>Create New Provider</h1>
                        <p className="page-description">Configure a new manufacturing provider</p>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="error" title={error.title || 'Failed to Create Provider'}>
                    {error.detail && <p>{error.detail}</p>}
                    {error.status && <p>Status code: {error.status}</p>}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="create-provider-form">
                {/* Basic Information */}
                <section className="form-section">
                    <h2 className="section-title">
                        <MaterialIcon icon="info" />
                        Basic Information
                    </h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="type">Provider Type</label>
                            <select
                                id="type"
                                className="form-input"
                                value={formData.type}
                                onChange={(e) => updateFormField('type', e.target.value)}
                                required
                            >
                                {PROVIDER_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Provider Name</label>
                            <input
                                id="name"
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => updateFormField('name', e.target.value)}
                                placeholder="Enter provider name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.autoStart}
                                    onChange={(e) => updateFormField('autoStart', e.target.checked)}
                                />
                                <span>Auto-start on system startup</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Technical Capabilities */}
                <section className="form-section">
                    <h2 className="section-title">
                        <MaterialIcon icon="construction" />
                        Technical Capabilities
                    </h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="axisHeight">Axis Height (mm)</label>
                            <input
                                id="axisHeight"
                                type="number"
                                step="0.1"
                                className="form-input"
                                value={technicalCapabilities.axisHeight}
                                onChange={(e) => updateTechnicalCapability('axisHeight', parseFloat(e.target.value))}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="power">Power (W)</label>
                            <input
                                id="power"
                                type="number"
                                step="1"
                                className="form-input"
                                value={technicalCapabilities.power}
                                onChange={(e) => updateTechnicalCapability('power', parseFloat(e.target.value))}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tolerance">Tolerance (mm)</label>
                            <input
                                id="tolerance"
                                type="number"
                                step="0.001"
                                className="form-input"
                                value={technicalCapabilities.tolerance}
                                onChange={(e) => updateTechnicalCapability('tolerance', parseFloat(e.target.value))}
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Process Capabilities */}
                <section className="form-section">
                    <h2 className="section-title">
                        <MaterialIcon icon="settings" />
                        Process Capabilities
                    </h2>
                    <ProcessCapabilitiesEditor
                        capabilities={processCapabilities}
                        onChange={handleProcessCapabilitiesChange}
                    />
                </section>

                {/* Working Hours */}
                <section className="form-section">
                    <h2 className="section-title">
                        <MaterialIcon icon="schedule" />
                        Working Hours
                    </h2>
                    
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={workingHours.is24x7}
                                onChange={(e) => updateWorkingHoursField('is24x7', e.target.checked)}
                            />
                            <span>24/7 Operation</span>
                        </label>
                    </div>

                    {!workingHours.is24x7 && (
                        <>
                            <div className="form-group">
                                <label>Working Days</label>
                                <div className="days-selector">
                                    {DAYS_OF_WEEK.map(day => (
                                        <label key={day} className="day-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={workingHours.workingDays.includes(day)}
                                                onChange={() => toggleWorkingDay(day)}
                                            />
                                            <span>{day.slice(0, 3)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="startHour">Work Day Start Hour</label>
                                    <input
                                        id="startHour"
                                        type="number"
                                        min="0"
                                        max="23"
                                        className="form-input"
                                        value={workingHours.workDayStartHour}
                                        onChange={(e) => updateWorkingHoursField('workDayStartHour', parseInt(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="endHour">Work Day End Hour</label>
                                    <input
                                        id="endHour"
                                        type="number"
                                        min="0"
                                        max="23"
                                        className="form-input"
                                        value={workingHours.workDayEndHour}
                                        onChange={(e) => updateWorkingHoursField('workDayEndHour', parseInt(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Break Periods</label>
                                <BreakPeriodsEditor
                                    breaks={breaks}
                                    onChange={handleBreaksChange}
                                />
                            </div>
                        </>
                    )}
                </section>

                {/* Submit */}
                <div className="form-actions">
                    <button 
                        type="button"
                        className="action-btn action-btn-secondary"
                        onClick={() => navigate('/providers')}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="action-btn action-btn-primary"
                        disabled={loading || !formData.name || processCapabilities.length === 0}
                    >
                        <MaterialIcon icon="add" size="S" />
                        {loading ? 'Creating...' : 'Create Provider'}
                    </button>
                </div>
            </form>
        </div>
    );
}
