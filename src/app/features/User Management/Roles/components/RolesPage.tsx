import { useDisclosure } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../_theme/themeConfigSlice';
import Table2 from '../../../../shared/components/datatables/Table2';
import { removeAlert } from '../../../../slices/usersSlice';
import { IRole, IRolesFormData } from '../models/roles';
import AddBody from './form/AddBody';
import DeleteBody from './form/DeleteBody';
import EditBody from './form/EditBody';
import PermissionBody from './form/PermissionBody';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';

interface IRolesPageProps {
    data: IRole[];
}

export const initialRoleData: IRole = {
    id: -1,
    name: '',
    description: '',
    permissions: [
        {
            id: -1,
            name: '',
        },
    ],
};

const RolesPage: FC<IRolesPageProps> = ({ data }) => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state?.auth?.user);

    const addPermission = user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Add Role'));
    const editPermission = user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Edit Role'));
    const deletePermission = user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Delete Role'));

    const [selectedData, setSelectedData] = useState<IRolesFormData>({
        id: -1,
        name: '',
        description: '',
        permissions: [],
    });

    const [opened, { open, close }] = useDisclosure(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSetSelectedData = (v: IRole) => {
        setSelectedId(v.id);
    };

    useEffect(() => {
        if (!selectedId) return;
        const fetchedData = data.find((d) => d.id === selectedId) ?? initialRoleData;
        setSelectedData({
            id: fetchedData.id,
            name: fetchedData.name,
            permissions: fetchedData.permissions?.map((p) => p.id) || [],
            description: fetchedData.description || '', // Ensure description is provided
        });
    }, [data, selectedId]);

    const title = 'Roles';
    const modalTitle = 'Role';
    const columns = [
        {
            title: 'Name',
            accessor: 'name',
            sortable: true,
        },
    ];

    useEffect(() => {
        dispatch(removeAlert());
        dispatch(setPageTitle('Roles'));
    }, []);

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
                addTitle={'Add Role'}
                opened={opened}
                open={open}
                close={close}
                AddBody={<AddBody close={close} />}
                EditBody={<EditBody close={close} selectedData={selectedData} permissions={undefined} />}
                DeleteBody={<DeleteBody roleId={selectedData.id} close={close} />}
                PermissionBody={<PermissionBody close={close} permissions={selectedData.permissions} />}
            />
        </>
    );
};
export default RolesPage;
