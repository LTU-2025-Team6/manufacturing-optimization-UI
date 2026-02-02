import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IOptimizationRequest } from '../../types/IOptimizationRequest';
import { useRequestOptimizationPlan } from '../../hooks/api/optimizationApi';
import OptimizationRequestForm from '../../components/OptimizationRequestForm/OptimizationRequestForm';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { generateRandomRequest } from '../../utils/requestGenerator';
import './RequestOptimizationPage.css';

const RequestOptimizationPage = (): ReactElement => {
    const navigate = useNavigate();
    
    // State
    const [request, setRequest] = useState<IOptimizationRequest>(() => generateRandomRequest());

    // Handler for form changes
    const handleRequestChange = (updatedRequest: IOptimizationRequest) => {
        setRequest(updatedRequest);
    };

    // API Hooks
    const { callApi: submitRequest, loading: submitting, error: submitError } = useRequestOptimizationPlan();

    // Handlers
    const handleSubmit = async (): Promise<void> => {
        try {
            const id = await submitRequest(request);
            navigate(`/plan/${id}`);
        } catch (err) {
            console.error('Failed to submit optimization request:', err);
        }
    };

    return (
        <div className='optimization-request-view'>
            <h1>Submit Optimization Request</h1>
            <OptimizationRequestForm request={request} onChange={handleRequestChange} />
            
            {submitError && (
                <Alert variant="error" title={submitError.title || 'Error'}>
                    {submitError.detail && <p>{submitError.detail}</p>}
                    {submitError.status && <p>Status code: {submitError.status}</p>}
                </Alert>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <Button onClick={handleSubmit} loading={submitting}>
                    Submit Request
                </Button>
            </div>
        </div>
    );
};

export default RequestOptimizationPage;