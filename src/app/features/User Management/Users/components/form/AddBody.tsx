import { useDispatch } from 'react-redux';
import { addAlert } from '../../../../../slices/usersSlice';
import { IUserFormData, SubmitUserFormDataType } from '../../models/user';
import { useAddUserMutation, useGetUserRolesQuery } from '../../services/usersApi';
import UsersForm from '../UsersForm';

interface IAddBodyProps {
    close: () => void;
}

function AddBody({ close }: IAddBodyProps) {
    const dispatch = useDispatch();
    const { data: rolesData, isFetching } = useGetUserRolesQuery();

    const roles = rolesData?.data?.roles ?? [];

    const [addUser, { isLoading }] = useAddUserMutation();

    const data: IUserFormData = {
        id: -1,
        name: '',
        email: '',
        roleId: -1,
        password: '',
        role: undefined,
    };

    async function submit(formData: SubmitUserFormDataType) {
        // Debugging

        try {
            const payload = await addUser(formData).unwrap();

            dispatch(
                addAlert({
                    variant: payload.success ? 'success' : 'warning',
                    message: payload.message,
                    title: payload.success ? 'Success!' : 'Warning!',
                })
            );
        } catch (error) {
            console.error('Add User Error:', error);
            dispatch(
                addAlert({
                    variant: 'danger',
                    message: 'Failed to add user.',
                    title: 'Error!',
                })
            );
        } finally {
            close();
        }
    }

    return <UsersForm data={data} close={close} roles={roles} add={submit} fetching={isFetching} />;
}

export default AddBody;
