import { useNavigate } from 'react-router-dom';
import Delete from '../../../../../shared/components/ui/Delete';
import { loginSuccess } from '../../../../../slices/authSlice';
import { IRootState } from '../../../../../store';
import { IAuthResponse } from '../../../../Authentication/models/auth';
import { useGetUserMutation } from '../../../../Authentication/services/authApi';
import { useState } from 'react';
import TransferDataModal from './TransferDataModal';
import IconTrashLines from '../../../../../../_theme/components/Icon/IconTrashLines';

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
    const [showWarning, setShowWarning] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);

    const deleteFun = (force = false) => {
        deleteUser({ id: userId, force })
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
                if (!payload.success && payload.message?.includes('contains data')) {
                    setShowWarning(true);
                    return;
                }

                dispatch(
                    addAlert({
                        variant: payload.success ? 'success' : 'warning',
                        message: payload.message,
                        title: payload.success ? 'Success!' : 'Warning!',
                    })
                );

                if (payload.success) close();
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
                // Do not forcefully close the modal here if warning is triggered
            });
    };

    if (showTransfer) {
        return <TransferDataModal userId={userId} close={close} />;
    }

    if (showWarning) {
        return (
            <div className="flex flex-col p-5 items-center text-center">
                <IconTrashLines className="w-12 h-12 text-danger mb-4" />
                <h3 className="text-lg font-bold">Warning: User Contains Data</h3>
                <p className="text-sm text-gray-600 my-4">
                    This user owns active Leads, Lists, Chats, or Tasks. Hard-deleting will permanently destroy everything associated with this account.
                </p>
                <div className="flex flex-col gap-3 w-full">
                    <button className="btn bg-primary text-white rounded-lg p-2 font-bold" onClick={() => setShowTransfer(true)}>
                        Transfer Data to another user
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => deleteFun(true)} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Delete anyway'}
                    </button>
                    <button className="btn border border-gray p-2 rounded-lg" onClick={close}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return <Delete message={message} close={close} delete={() => deleteFun(false)} isDeleting={isLoading} />;
}

export default DeleteBody;
