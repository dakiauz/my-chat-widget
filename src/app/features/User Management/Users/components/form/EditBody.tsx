import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../../../../slices/authSlice';
import { addAlert } from '../../../../../slices/usersSlice';
import { IRootState } from '../../../../../store';
import { IAuthResponse } from '../../../../Authentication/models/auth';
import { useGetUserMutation } from '../../../../Authentication/services/authApi';
import { IUserFormData, SubmitUserFormDataType } from '../../models/user';
import { useGetUserRolesQuery, useUpdateUserMutation } from '../../services/usersApi';
import UsersForm from '../UsersForm';

interface IEditBodyProps {
    close: () => void;
    data: IUserFormData;
}

function EditBody({ close, data }: IEditBodyProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state: IRootState) => state.auth);

    // Fetch user roles from the backend
    const {
        data: rolesData,
        error: rolesError,
        isFetching,
    } = useGetUserRolesQuery(undefined, {
        refetchOnMountOrArgChange: true, // Refetch roles when component mounts or args change
    });

    // Ensure roles are correctly extracted
    const roles = rolesData?.data?.roles ?? [];

    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [authData] = useGetUserMutation();

    function submit(formData: SubmitUserFormDataType, userId: number) {
        return new Promise<void>((resolve, reject) => {
            if (!formData || !userId) return resolve();
            updateUser({ formData, userId })
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
                            .catch(() => {
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
                            message: error?.error?.message ?? error?.message ?? 'Failed to edit user.',
                            title: 'Error!',
                        })
                    );
                })
                .finally(() => {
                    close();
                    resolve();
                });
        });
    }

    return (
        <>
            <UsersForm
                data={data}
                close={close}
                roles={roles} // ✅ Ensure extracted roles are passed
                edit={submit}
                fetching={isFetching || isUpdating} // Show loading if fetching
            />
        </>
    );
}

export default EditBody;
