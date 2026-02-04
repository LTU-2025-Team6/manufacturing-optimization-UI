import { ReactElement, useState } from 'react';
import { useGetProviderSchedule } from '../../hooks/api/providerApi';
import { IProviderScheduleRequest } from '../../types/IProviderScheduleRequest';
import { IProviderDayScheduleDto } from '../../types/IProviderSchedule';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import DataState from '../DataState/DataState';
import Timeline from '../Timeline/Timeline';
import './ProviderScheduleView.css';

interface ProviderScheduleViewProps {
    providerId: string;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export default function ProviderScheduleView({ providerId }: ProviderScheduleViewProps): ReactElement {
    const { data: scheduleData, loading, error, callApi } = useGetProviderSchedule();
    const [startDate, setStartDate] = useState(formatDate(new Date()));
    const [endDate, setEndDate] = useState(formatDate(new Date(new Date().setDate(new Date().getDate() + 7))));

    const handleShowSchedule = async () => {
        if (!startDate || !endDate) {
            return;
        }

        const request: IProviderScheduleRequest = {
            startDate,
            endDate
        };

        await callApi(providerId, request);
    };

    return (
        <div className="provider-schedule-view">
            <div className="schedule-controls">
                <div className="schedule-date-inputs">
                    <div className="schedule-input-group">
                        <label htmlFor="startDate">Start Date:</label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="schedule-input-group">
                        <label htmlFor="endDate">End Date:</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <Button 
                    onClick={handleShowSchedule}
                    disabled={!startDate || !endDate}
                >
                    Show Schedule
                </Button>
            </div>

            {error && (
                <Alert variant="error">
                    Failed to load schedule: {error.title || error.detail || 'Unknown error'}
                </Alert>
            )}

            <DataState
                data={scheduleData}
                loading={loading}
                error={error}
            >
                {(schedule: IProviderDayScheduleDto[]) => (
                    <div className="schedule-timeline-container">
                        {schedule.length === 0 ? (
                            <p>No schedule data available for selected dates</p>
                        ) : (
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Timeline</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map((daySchedule: IProviderDayScheduleDto) => (
                                        <tr key={daySchedule.date}>
                                            <td className="schedule-date-cell">
                                                {new Date(daySchedule.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="schedule-timeline-cell">
                                                <Timeline 
                                                    segments={daySchedule.segments}
                                                    showTimeLabels={false}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </DataState>
        </div>
    );
}
