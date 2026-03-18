interface IEditBodyProps {
    close: () => void;
    selectedData: IRolesFormData;
    permissions: any;
}
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../../../../slices/authSlice';
import { addAlert } from '../../../../../slices/usersSlice';
import { IRootState } from '../../../../../store';
import { IAuthResponse } from '../../../../Authentication/models/auth';
import { useGetUserMutation } from '../../../../Authentication/services/authApi';
import { IAddRolePayload, IRolesFormData } from '../../models/roles';
import { useGetPermissionsQuery, useUpdateRoleMutation } from '../../services/rolesApi';
import RolesForm from '../RolesForm';

function EditBody({ close, selectedData: data }: IEditBodyProps) {
    const dispatch = useDispatch();
    const { data: permissionsData } = useGetPermissionsQuery();
    const [updateRole] = useUpdateRoleMutation();

    const auth = useSelector((state: IRootState) => state.auth);
    const [authData] = useGetUserMutation();

    const navigate = useNavigate();

    function submit(formData: IAddRolePayload, roleId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!formData || !roleId) return resolve();
            updateRole({ formData, roleId })
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
                            message: error?.error?.message ?? error?.message ?? 'Failed to edit role.',
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
            <RolesForm data={data} close={close} permissions={permissionsData?.data ?? []} edit={submit} />
        </>
    );
}

export default EditBody;
