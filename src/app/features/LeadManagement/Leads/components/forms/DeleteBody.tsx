import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Delete from '../../../../../shared/components/ui/Delete';

import { addAlert } from '../../../../../slices/systemAlertSlice';
import { useDeleteLeadMutation } from '../../services/leadsApi';

type DeleteBodyProps = {
    message?: string;
    close: () => void;
    leadId: number;
};

function DeleteBody({ message, close, leadId }: DeleteBodyProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [deleteLead, { isLoading }] = useDeleteLeadMutation();

    const deleteFun = () => {
        deleteLead(leadId)
            .unwrap()
            .then((payload: any) => {
                dispatch(
                    addAlert({
                        variant: payload.success ? 'success' : 'warning',
                        message: payload.message,
                        title: payload.success ? 'Success!' : 'Warning!',
                    })
                );
            })
            .catch((error: any) => {
                console.log(error);
                dispatch(
                    addAlert({
                        variant: 'danger',
                        message: error?.error?.message ?? error?.message ?? 'Failed to delete lead.',
                        title: 'Error!',
                    })
                );
            })
            .finally(() => {
                close();
            });
    };

    return <Delete message={message} close={close} delete={deleteFun} isDeleting={isLoading} />;
}

export default DeleteBody;
