import { useNavigate } from 'react-router-dom';
import Delete from '../../../../../shared/components/ui/Delete';
import { loginSuccess } from '../../../../../slices/authSlice';
import { IRootState } from '../../../../../store';
import { IAuthResponse } from '../../../../Authentication/models/auth';
import { useGetUserMutation } from '../../../../Authentication/services/authApi';

import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from '../../../../../slices/usersSlice';
import { useDeleteUserMutation } from '../../services/usersApi';

type DeleteBodyProps = {
    message?: string;
    close: () => void;
    userId: number;
};

function DeleteBody({ message, close, userId }: DeleteBodyProps) {
    const dispatch = useDispatch();
    const [authData] = useGetUserMutation();
    const auth = useSelector((state: IRootState) => state.auth);
    const navigate = useNavigate();
    const [deleteUser, { isLoading }] = useDeleteUserMutation();

    const deleteFun = () => {
        deleteUser(userId)
            .unwrap()
            .then((payload: any) => {
                if (auth.user?.id === userId && auth.token) {
                    authData(auth.token)
                        .unwrap()
                        .then((res: IAuthResponse) => {
                            if (res.success) {
                                let userData = {
                                    user: {
                                        ...res.data,
                                    },
                                    token: auth.token,
                                };
                                dispatch(loginSuccess(userData));
                            } else {
                                navigate('/logout');
                            }
                        })
                        .catch((error: any) => {
                            navigate('/logout');
                        });
                }
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
                        variant: `danger`,
                        message: error?.error?.message ?? error?.message ?? 'Failed to delete user.',
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
