import { useParams, useNavigate } from 'react-router-dom';
import ExecutionList from '../../components/ExecutionList/ExecutionList';
import ExecutionDetails from '../../components/ExecutionDetails/ExecutionDetails';
import SimulationTimePanel from '../../components/SimulationTimePanel/SimulationTimePanel';
import './ExecutionMonitorPage.css';

export default function ExecutionMonitorPage() {
    const { planId } = useParams<{ planId?: string }>();
    const navigate = useNavigate();

    const handleSelectExecution = (selectedPlanId: string) => {
        navigate(`/executions/${selectedPlanId}`);
    };

    const handleCloseExecution = () => {
        navigate('/executions');
    };

    return (
        <div className="execution-monitor-view">
            <div className="simulation-panel-wrapper">
                <SimulationTimePanel />
            </div>
            
            <div className="execution-monitor-header">
                <h1>Execution Monitor</h1>
            </div>
            
            <div className="execution-monitor-layout">
                <div className="execution-list-sidebar">
                    <ExecutionList 
                        onSelectExecution={handleSelectExecution}
                        selectedPlanId={planId || null}
                    />
                </div>
                
                <div className="execution-details-container">
                    {planId ? (
                        <ExecutionDetails 
                            key={planId}
                            planId={planId}
                            onClose={handleCloseExecution}
                        />
                    ) : (
                        <div className="execution-placeholder">
                            <p>Select an execution from the list to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
