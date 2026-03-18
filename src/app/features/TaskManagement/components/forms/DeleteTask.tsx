import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Delete from '../../../../shared/components/ui/Delete';
import { addAlert } from '../../../../slices/systemAlertSlice';
import { useDeleteTaskMutation } from '../../services/tasksApi';

type DeleteTaskBodyProps = {
    message?: string;
    close: () => void;
    taskId: number;
};

function DeleteTaskBody({ message, close, taskId }: DeleteTaskBodyProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [deleteTask, { isLoading }] = useDeleteTaskMutation();

    const deleteFun = () => {
        deleteTask(taskId)
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
                        message: error?.error?.message ?? error?.message ?? 'Failed to delete task.',
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

export default DeleteTaskBody;
