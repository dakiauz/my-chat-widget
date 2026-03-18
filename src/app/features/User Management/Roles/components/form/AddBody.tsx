import { useDispatch } from 'react-redux';
import { baseApi } from '../../../../../slices/baseApiSlice';
import { addAlert } from '../../../../../slices/usersSlice';
import { IAddRolePayload, IRolesFormData } from '../../models/roles';
import { useAddRoleMutation, useGetPermissionsQuery } from '../../services/rolesApi';
import RolesForm from '../RolesForm';
interface IAddBodyProps {
    close: () => void;
}
function AddBody({ close }: IAddBodyProps) {
    const dispatch = useDispatch();
    const { data: permissionsData } = useGetPermissionsQuery();
    const [addRole] = useAddRoleMutation();
    const data: IRolesFormData = {
        id: -1,
        name: '',
        permissions: [],
        description: ''
    };

    function submit(formData: IAddRolePayload): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!formData) return resolve();
            addRole(formData)
                .unwrap()
                .then((payload: any) => {
                    dispatch(
                        addAlert({
                            variant: payload.success ? 'success' : 'warning',
                            message: payload.message,
                            title: payload.success ? 'Success!' : 'Warning!',
                        })
                    );
                    dispatch(baseApi.util.invalidateTags(['Roles']));
                })
                .catch((error: any) => {
                    console.log(error);
                    dispatch(
                        addAlert({
                            variant: `danger`,
                            message: error?.error?.message ?? error?.message ?? 'Failed to add role.',
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
    return <RolesForm data={data} close={close} permissions={permissionsData?.data ?? []} add={submit} />;
}
export default AddBody;
