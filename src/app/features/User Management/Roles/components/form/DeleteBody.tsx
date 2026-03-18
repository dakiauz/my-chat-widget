import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Delete from '../../../../../shared/components/ui/Delete';
import { loginSuccess } from '../../../../../slices/authSlice';
import { addAlert } from '../../../../../slices/usersSlice';
import { IRootState } from '../../../../../store';
import { IAuthResponse } from '../../../../Authentication/models/auth';
import { useGetUserMutation } from '../../../../Authentication/services/authApi';
import { useDeleteRoleMutation } from '../../services/rolesApi';

type DeleteBodyProps = {
    message?: string;
    close: () => void;
    roleId: number;
};

function DeleteBody({ message, close, roleId }: DeleteBodyProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state: IRootState) => state.auth);
    const [authData] = useGetUserMutation();

    const [deleteUser, { isLoading }] = useDeleteRoleMutation();

    const deleteFun = () => {
        deleteUser(roleId)
            .unwrap()
            .then((payload: any) => {
                if (auth.user?.roles?.some((role: any) => role.id === roleId) && auth.token) {
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
                        message: error?.error?.message ?? error?.message ?? 'Failed to delete role.',
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
