import { FC, useCallback, useEffect, useState } from 'react';
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
                data={data ?? []}
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
