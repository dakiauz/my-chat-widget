import { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { Select, Text, Badge } from '@mantine/core';
import { useGetUsersQuery } from '@/app/features/User Management/Users/services/usersApi';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';
import AsyncDataTable from '../../../shared/components/datatables/AsyncDataTable';
import { IRootState } from '../../../store';
import DeleteBody from './components/forms/DeleteBody';
import { ILeadList } from './models/leadsList';
import AddBody from './components/forms/AddBody';
import EditBody from './components/forms/EditBody';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@/app/shared/components/ui/Tooltip';

interface ILeadsPageProps {
    data: ILeadList[];
    fetching?: boolean;
}

export const initialLeadListData: ILeadList = {
    id: -1,
    company_id: -1,
    name: '',
    description: '',
};

const LeadsListPage: FC<ILeadsPageProps> = ({ data, fetching }) => {
    const dispatch = useDispatch();

    const [selectedData, setSelectedData] = useState<ILeadList>(initialLeadListData);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Leads List'));
    }, [dispatch]);

    const handleSetSelectedData = (v: ILeadList) => {
        setSelectedId(v.id);
    };

    useEffect(() => {
        if (!selectedId) return;

        const fetchedData = data.find((d) => d.id === selectedId) ?? initialLeadListData;

        setSelectedData(fetchedData);
    }, [data, selectedId]);

    const user = useSelector((state: IRootState) => state.auth.user);
    const isOwner = user?.roles?.some((role: any) => role.name === 'owner');

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const { data: usersData, isFetching: isUsersFetching } = useGetUsersQuery(undefined, { skip: !isOwner });

    const usersOptions = useMemo(() => {
        if (!usersData?.data?.users) return [];
        return usersData.data.users.map((u: any) => ({
            value: String(u.id),
            label: u.name,
        }));
    }, [usersData]);

    const filteredData = useMemo(() => {
        if (!data) return [];
        if (isOwner && selectedUserId) {
            return data.filter((item: any) => item.user_id?.toString() === selectedUserId || item.user?.id?.toString() === selectedUserId);
        }
        return data;
    }, [data, isOwner, selectedUserId]);

    const filterBody = isOwner ? (
        <div className="flex flex-col flex-grow p-4 gap-4">
            <Text size="sm" fw={500} className="mb-2">
                Filter Options
            </Text>
            <div>
                <Text size="xs" className="mb-1 text-gray-600">
                    Sub User
                </Text>
                <Select
                    placeholder="Filter by Sub User"
                    data={usersOptions}
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    searchable
                    clearable
                    nothingFound="No users found"
                    size="sm"
                    disabled={isUsersFetching}
                />
            </div>
        </div>
    ) : undefined;

    // Permissions
    const addPermission = user?.roles?.some((role) => {
        return role.permissions?.some((p) => {
            return p.name === 'Add Lead List';
        });
    });

    const editPermission = user?.roles?.some((role) => {
        return role.permissions?.some((p) => {
            return p.name === 'Edit Lead List';
        });
    });

    const deletePermission = user?.roles?.some((role) => {
        return role.permissions?.some((p) => {
            return p.name === 'Delete Lead List';
        });
    });

    const viewLeadPermission = user?.roles?.some((role) => {
        return role.permissions?.some((p) => {
            return p.name === 'View Lead';
        });
    });

    const showFullDescriptionFromDataById = useCallback(
        (id: number): string => {
            const leadList = data.find((d) => d.id === id);
            return leadList?.description || '';
        },
        [data]
    );

    const columns = [
        { title: 'Name', accessor: 'name', sortable: true },
        {
            title: 'Description',
            accessor: 'description',
            sortable: true,
            render: (row: any) => (
                <Tooltip content={showFullDescriptionFromDataById(row.id)}>
                    <span>{row.description}</span>
                </Tooltip>
            ),
        },
        ...(isOwner
            ? [
                {
                    title: 'Creator',
                    accessor: 'user.name',
                    sortable: true,
                    render: (row: any) => (
                        <Badge variant="light" color="blue">
                            {row.user?.name || 'Company Owner'}
                        </Badge>
                    ),
                },
            ]
            : []),
    ];

    // Modal functions
    const openModal = () => setModalOpen(true); // Open the modal
    const closeModal = () => setModalOpen(false); // Close the modal

    const navigate = useNavigate();

    const handleRowClick = async (row: ILeadList): Promise<void> => {
        navigate(`/leads/${row.id}`);
    };

    const view = (id: number) => {
        const fetchedData = data.find((d) => d.id === id) ?? initialLeadListData;
        handleRowClick(fetchedData);
    };

    return (
        <>
            <AsyncDataTable
                addPermission={!!addPermission}
                editPermission={!!editPermission}
                deletePermission={!!deletePermission}
                view={viewLeadPermission ? view : undefined}
                className="mt-6"
                serial={false}
                actions
                title="Leads List"
                modalTitle="Lead List"
                columns={columns}
                data={filteredData ?? []}
                filterBody={filterBody}
                handleSetSelectedData={handleSetSelectedData}
                addTitle={'Add Lead'}
                fetching={fetching}
                opened={modalOpen}
                open={openModal}
                close={closeModal}
                edit={undefined}
                AddBody={<AddBody close={closeModal} />}
                EditBody={<EditBody data={selectedData} close={closeModal} />}
                DeleteBody={<DeleteBody leadListId={selectedData.id} close={closeModal} />}
                handleRowClick={viewLeadPermission ? handleRowClick : undefined}
            />
        </>
    );
};

export default LeadsListPage;
