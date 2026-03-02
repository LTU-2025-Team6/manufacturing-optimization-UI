import { ReactElement, useEffect } from 'react';
import { useGetExecutionDetails } from '../../hooks/api/providerApi';
import Modal from '../Modal/Modal';
import ExecutionDetailsView from '../ExecutionDetailsView/ExecutionDetailsView';

interface ExecutionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    providerId: string;
    executionId: string;
}

export default function ExecutionDetailsModal({ 
    isOpen, 
    onClose, 
    providerId, 
    executionId 
}: ExecutionDetailsModalProps): ReactElement {
    const { data, loading, error, callApi } = useGetExecutionDetails();

    useEffect(() => {
        if (isOpen && providerId && executionId) {
            callApi(providerId, executionId);
        }
    }, [isOpen, providerId, executionId]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Execution Details"
            size="large"
        >
            <ExecutionDetailsView
                executionDetails={data}
                loading={loading}
                error={error}
            />
        </Modal>
    );
}
