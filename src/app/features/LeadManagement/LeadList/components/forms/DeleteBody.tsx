import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Delete from '../../../../../shared/components/ui/Delete';

import { addAlert } from '../../../../../slices/systemAlertSlice';
import { useDeleteLeadListMutation } from '../../services/leadsListApi';

type DeleteBodyProps = {
    message?: string;
    close: () => void;
    leadListId: number;
};

function DeleteBody({ message, close, leadListId }: DeleteBodyProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [deleteLeadList, { isLoading }] = useDeleteLeadListMutation();

    const deleteFun = () => {
        deleteLeadList(leadListId)
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
                        message: error?.error?.message ?? error?.message ?? 'Failed to delete lead list.',
                        title: 'Error!',
                    })
                );
            })
            .finally(() => {
                close();
            });
    };

    return <Delete mode="github" confirmText="delete this" message="Deleting this lead list will permanently remove all associated data." close={close} delete={deleteFun} isDeleting={isLoading} />;
}

export default DeleteBody;
