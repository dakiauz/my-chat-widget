import { useDisclosure } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';
import Table2 from '../../../shared/components/datatables/Table2';
import { removeAlert } from '../../../slices/usersSlice';
import AddBody from './components/form/AddBody';
import DeleteBody from './components/form/DeleteBody';
import EditBody from './components/form/EditBody';
import { IUser, IUserFormData } from './models/user';
import { IRootState } from '../../../store';
import { useSelector } from 'react-redux';

interface IUsersPageProps {
    data: IUser[];
    fetching?: boolean;
}

export const initialUserData: IUser = {
    id: -1,
    name: '',
    email: '',
    company_id: -1,
    roles: [
        {
            id: -1,
            name: '',
            description: '',
            permissions: [],
        },
    ],
};

const UsersPage: FC<IUsersPageProps> = ({ data, fetching }) => {
    const dispatch = useDispatch();
    const auth = useSelector((state: IRootState) => state.auth);
    const addPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Add User'));
    const editPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Edit User'));
    const deletePermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Delete User'));

    const [selectedData, setSelectedData] = useState<IUserFormData>({
        id: -1,
        name: '',
        email: '',
        password: '',
        roleId: null,
        role: [], // ✅ Use `role` instead of `roles`
    });

    const [opened, { open, close }] = useDisclosure(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSetSelectedData = (v: IUser) => {
        setSelectedId(v.id);
    };

    useEffect(() => {
        if (!selectedId) return;
        const fetchedData = data.find((d) => d.id === selectedId) ?? initialUserData;
        setSelectedData({
            id: fetchedData.id,
            name: fetchedData.name ?? '',
            email: fetchedData.email ?? '',
            password: '',
            roleId: fetchedData.roles?.[0]?.id ?? null, // ✅ Ensure roleId is extracted properly
            role: fetchedData.roles ?? [],
        });
    }, [data, selectedId]);

    useEffect(() => {
        dispatch(removeAlert());
        dispatch(setPageTitle('Users'));
    }, []);

    const title = 'Users';
    const modalTitle = 'User';
    const columns = [
        {
            title: 'Name',
            accessor: 'name',
            sortable: true,
        },
        {
            title: 'Email',
            accessor: 'email',
            sortable: true,
        },
        {
            title: 'Role',
            accessor: 'roles[0].name',
            sortable: true,
        },
    ];

    return (
        <>
            <Table2
                className="mt-6"
                restrictAdminRow={true}
                addPermission={addPermission}
                editPermission={editPermission}
                deletePermission={deletePermission}
                serial
                actions
                title={title}
                modalTitle={modalTitle}
                columns={columns}
                data={data ?? []}
                handleSetSelectedData={handleSetSelectedData}
                addTitle={'Add User'}
                opened={opened}
                open={open}
                close={close}
                AddBody={<AddBody close={close} />}
                EditBody={<EditBody close={close} data={selectedData} />}
                DeleteBody={<DeleteBody userId={selectedData.id} close={close} />}
                fetching={fetching}
            />
        </>
    );
};

export default UsersPage;
