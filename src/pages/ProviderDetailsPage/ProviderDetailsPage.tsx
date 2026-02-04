import { ReactElement, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProvider, useUpdateProvider } from '../../hooks/api/providerApi';
import { 
    IProvider, 
    IUpdateProviderRequest, 
    IProviderBreakPeriod,
    IUpdateProcessCapabilitiesRequest,
    IUpdateProviderTechnicalCapabilitiesRequest,
    IUpdateProviderWorkingHoursRequest,
    IUpdateBreakPeriodRequest
} from '../../types/IProvider';
import { IProcessCapability } from '../../types/IProcessCapability';
import DataState from '../../components/DataState/DataState';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Collapsible from '../../components/Collapsible/Collapsible';
import ProcessCapabilitiesEditor from '../../components/ProcessCapabilitiesEditor/ProcessCapabilitiesEditor';
import BreakPeriodsEditor from '../../components/BreakPeriodsEditor/BreakPeriodsEditor';
import ProviderScheduleView from '../../components/ProviderScheduleView/ProviderScheduleView';
import './ProviderDetailsPage.css';

const ProviderDetailsPage = (): ReactElement => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, loading, error, callApi } = useGetProvider();
    const { loading: saving, error: saveError, callApi: updateProvider } = useUpdateProvider();
    const [editedProvider, setEditedProvider] = useState<IProvider | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (id) {
            callApi(id);
        }
    }, [id]);

    useEffect(() => {
        if (data) {
            setEditedProvider(data);
        }
    }, [data]);

    const handleSave = async () => {
        if (!editedProvider || !id) return;
        
        const processCapabilities: IUpdateProcessCapabilitiesRequest[] = editedProvider.processCapabilities.map(cap => ({
            process: cap.process,
            costPerHour: cap.costPerHour,
            speedMultiplier: cap.speedMultiplier,
            qualityScore: cap.qualityScore,
            energyConsumptionKwhPerHour: cap.energyConsumptionKwhPerHour,
            carbonIntensityKgCO2PerKwh: cap.carbonIntensityKgCO2PerKwh,
            usesRenewableEnergy: cap.usesRenewableEnergy
        }));

        const technicalCapabilities: IUpdateProviderTechnicalCapabilitiesRequest = {
            axisHeight: editedProvider.technicalCapabilities.axisHeight,
            power: editedProvider.technicalCapabilities.power,
            tolerance: editedProvider.technicalCapabilities.tolerance
        };

        const breaks: IUpdateBreakPeriodRequest[] = editedProvider.workingHours.breaks.map(b => ({
            startHour: b.startHour,
            startMinute: b.startMinute,
            durationMinutes: b.durationMinutes,
            name: b.name
        }));

        const workingHours: IUpdateProviderWorkingHoursRequest = {
            workingDays: editedProvider.workingHours.workingDays,
            workDayStartHour: editedProvider.workingHours.workDayStartHour,
            workDayEndHour: editedProvider.workingHours.workDayEndHour,
            is24x7: editedProvider.workingHours.is24x7,
            breaks: breaks
        };

        const request: IUpdateProviderRequest = {
            name: editedProvider.name,
            autoStart: editedProvider.autoStart,
            processCapabilities: processCapabilities,
            technicalCapabilities: technicalCapabilities,
            workingHours: workingHours
        };

        try {
            await updateProvider(id, request);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            await callApi(id); // Refresh data
        } catch (err) {
            console.error('Failed to save provider', err);
        }
    };

    const updateField = (field: keyof IProvider, value: any) => {
        if (!editedProvider) return;
        setEditedProvider({ ...editedProvider, [field]: value });
    };

    const updateTechnicalCapability = (field: string, value: any) => {
        if (!editedProvider) return;
        setEditedProvider({
            ...editedProvider,
            technicalCapabilities: {
                ...editedProvider.technicalCapabilities,
                [field]: value
            }
        });
    };

    const updateWorkingHours = (field: string, value: any) => {
        if (!editedProvider) return;
        setEditedProvider({
            ...editedProvider,
            workingHours: {
                ...editedProvider.workingHours,
                [field]: value
            }
        });
    };

    const updateProcessCapabilities = (capabilities: IProcessCapability[]) => {
        if (!editedProvider) return;
        setEditedProvider({
            ...editedProvider,
            processCapabilities: capabilities
        });
    };

    const toggleWorkingDay = (day: string) => {
        if (!editedProvider) return;
        const currentDays = editedProvider.workingHours.workingDays;
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        updateWorkingHours('workingDays', newDays);
    };

    const updateBreaks = (breaks: IProviderBreakPeriod[]) => {
        updateWorkingHours('breaks', breaks);
    };

    return (
        <div className='provider-details-page'>
            <div className="provider-details-header">
                <Button onClick={() => navigate('/providers')}>
                    ← Back to Providers
                </Button>
                <Button 
                    onClick={handleSave} 
                    disabled={!editedProvider}
                    variant="primary"
                >
                    Save Changes
                </Button>
            </div>

            {saveSuccess && (
                <Alert variant="success">Provider updated successfully!</Alert>
            )}

            {saveError && (
                <Alert variant="error">
                    Failed to save: {saveError.title || saveError.detail || 'Unknown error'}
                    {saveError.errors && (
                        <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                            {Object.entries(saveError.errors).map(([field, messages]) => (
                                <li key={field}>
                                    <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : String(messages)}
                                </li>
                            ))}
                        </ul>
                    )}
                </Alert>
            )}

            <DataState 
                loading={loading} 
                error={error} 
                data={editedProvider}
                loadingMessage="Loading provider details..."
                emptyMessage="Provider not found"
            >
                {(provider) => (
                    <div className="provider-details-content">
                        <Collapsible title="Basic Information" defaultOpen={true}>
                            <div className="form-group">
                                <label>Name</label>
                                <input 
                                    type="text" 
                                    value={provider.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Type: {provider.type}</label>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={provider.autoStart}
                                        onChange={(e) => updateField('autoStart', e.target.checked)}
                                    />
                                    {' '}Auto Start
                                </label>
                            </div>
                        </Collapsible>

                        <Collapsible title="Technical Capabilities" defaultOpen={false}>
                            <div className="form-group">
                                <label>Axis Height (mm)</label>
                                <input 
                                    type="number" 
                                    value={provider.technicalCapabilities.axisHeight}
                                    onChange={(e) => updateTechnicalCapability('axisHeight', Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Power (kW)</label>
                                <input 
                                    type="number" 
                                    value={provider.technicalCapabilities.power}
                                    onChange={(e) => updateTechnicalCapability('power', Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tolerance</label>
                                <input 
                                    type="text" 
                                    value={provider.technicalCapabilities.tolerance}
                                    onChange={(e) => updateTechnicalCapability('tolerance', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </Collapsible>

                        <Collapsible title="Working Hours" defaultOpen={false}>
                            <div className="form-group">
                                <label>Work Day Start Hour</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="23"
                                    value={provider.workingHours.workDayStartHour}
                                    onChange={(e) => updateWorkingHours('workDayStartHour', Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Work Day End Hour</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="23"
                                    value={provider.workingHours.workDayEndHour}
                                    onChange={(e) => updateWorkingHours('workDayEndHour', Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={provider.workingHours.is24x7}
                                        onChange={(e) => updateWorkingHours('is24x7', e.target.checked)}
                                    />
                                    {' '}24/7 Operation
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Working Days</label>
                                <div className="checkbox-group">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <label key={day} className="checkbox-label">
                                            <input 
                                                type="checkbox" 
                                                checked={provider.workingHours.workingDays.includes(day)}
                                                onChange={() => toggleWorkingDay(day)}
                                            />
                                            {' '}{day}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Break Periods</label>
                                <BreakPeriodsEditor 
                                    breaks={provider.workingHours.breaks}
                                    onChange={updateBreaks}
                                />
                            </div>
                        </Collapsible>

                        <Collapsible title={`Process Capabilities (${provider.processCapabilities.length})`} defaultOpen={true}>
                            <ProcessCapabilitiesEditor 
                                capabilities={provider.processCapabilities}
                                onChange={updateProcessCapabilities}
                            />
                        </Collapsible>
                    </div>
                )}
            </DataState>
        </div>
    );
};

export default ProviderDetailsPage;
