import { Button, Loader, Select, Popover, Text, Stack, Badge, MultiSelect } from '@mantine/core';
import { FC, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';
import { ILead } from './models/lead';
import { sourceColors } from './constants/data';
import DeleteBody from './components/forms/DeleteBody';
import EditBody from './components/forms/EditBody';
import AddBody from './components/forms/AddBody';
import ScrumBoard from './components/Scrumboard';
import { useGetLeadsQuery, useImportLeadMutation, useUpdateLeadMutation } from './services/leadsApi';
import { useGetLeadsListQuery } from '../LeadList/services/leadsListApi';
import ImportData from '../../ImportData';
import { useGetLeadStatusQuery, useUpdateLeadStatusMutation } from '../LeadStatus/services/leadsStatusApi';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import { IRootState } from '../../../store';
import { useSelector } from 'react-redux';
import { setImportFile, setImportLeadResponse } from '@/app/slices/leadSlice';

interface ILeadsPageProps {
    data: ILead[];
    fetching?: boolean;
    setSelectedLeadList: (leadListId: string) => void;
    selectedLeadList: string;
    setIsKanban: (isKanban: boolean) => void;
    selectedSources?: string[];
    setSelectedSources?: (sources: string[]) => void;
}

const LeadsKanban: FC<ILeadsPageProps> = ({ data, fetching, setSelectedLeadList, selectedLeadList, setIsKanban, selectedSources, setSelectedSources }) => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const [filterPopoverOpened, setFilterPopoverOpened] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Leads'));
    }, [dispatch]);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openDeleteModal = (leadId: number) => {
        setSelectedLeadId(leadId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setSelectedLeadId(null);
        setIsDeleteModalOpen(false);
    };

    const openEditModal = (leadId: number) => {
        setSelectedLeadId(leadId);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedLeadId(null);
        setIsEditModalOpen(false);
    };

    const {
        data: leadsListStatusData,
        isFetching: isLeadsListStatusFetching,
        isLoading: isLeadsListStatusLoading,
        isError: isLeadsListStatusError,
        error: leadsListStatusError,
    } = useGetLeadStatusQuery(+selectedLeadList);

    const auth = useSelector((state: IRootState) => state.auth);
    // Permissions
    const addPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Add Lead'));

    const editPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Edit Lead'));

    const deletePermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Delete Lead'));

    // New permission check for kanban status editing
    const editKanbanPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Edit Kanban status'));

    const { data: leadListData, isFetching: leadListFetching } = useGetLeadsListQuery();

    const leadListsOptions = useMemo(() => {
        if (!leadListData?.data.leadLists) return [];
        return leadListData?.data.leadLists.map((leadList) => ({
            value: leadList.id + '',
            label: leadList.name,
        }));
    }, [leadListData]);

    const sourceOptions = useMemo(() => {
        const sources = Object.keys(sourceColors);
        return sources.map((source) => ({
            value: source,
            label: source,
        }));
    }, []);

    // Get active filters count for badge
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedSources && selectedSources.length > 0) count++;
        return count;
    }, [selectedSources]);

    // Get selected lead list name for display
    const selectedLeadListName = useMemo(() => {
        const leadList = leadListData?.data.leadLists?.find((list) => list.id + '' === selectedLeadList);
        return leadList?.name || '';
    }, [leadListData, selectedLeadList]);

    const [updateLeadMutation, { isLoading: isUpdating }] = useUpdateLeadMutation();

    const [updateLeadStatusMutation] = useUpdateLeadStatusMutation();

    const [cards, setCards] = useState<any[]>([]);
    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return cards;

        return cards.map((col) => ({
            ...col,
            leads: col.leads.filter((lead: ILead) => {
                const searchParams = `${lead.firstName ?? ''} ${lead.lastName ?? ''} ${lead?.status?.name ?? ''} ${lead.jobTitle ?? ''} ${lead.companyName ?? ''}`.toLowerCase();
                return searchParams.includes(searchQuery.toLowerCase());
            }),
        }));
    }, [searchQuery, cards]);

    const status = useMemo(() => {
        return leadsListStatusData?.data?.statuses ?? [];
    }, [leadsListStatusData?.data?.statuses]);

    const handleDragEnd = async (leadId: number, newStatusId: number) => {
        if (!editKanbanPermission) {
            alert("You don't have permission to edit the Kanban status.");
            throw new Error('No permission');
        }

        const taskToUpdate = data.find((lead) => lead.id === Number(leadId));
        if (!taskToUpdate) return;

        const updatedTask = { ...taskToUpdate, status: status[newStatusId - 1] };

        const response = await updateLeadMutation({
            id: taskToUpdate.id,
            formData: {
                firstName: updatedTask.firstName ?? '',
                lastName: updatedTask.lastName,
                email: updatedTask.email,
                phone: updatedTask.phone,
                companyName: updatedTask.companyName,
                websiteUrl: updatedTask.websiteUrl,
                jobTitle: updatedTask.jobTitle,
                socialMediaUrl: updatedTask.socialMediaUrl,
                companyLinkedInUrl: updatedTask.companyLinkedInUrl,
                statusId: newStatusId,
                lead_list_id: updatedTask?.lead_list?.id ?? -1,
            },
        })
            .unwrap()
            .then((res) => {
                return res;
            })
            .catch((err) => {
                throw new Error(err?.data?.message || 'API failed');
            });
    };

    const [importLead] = useImportLeadMutation();
    const importSubmit = (data: any): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            if (!data) resolve(null);
            const formData = new FormData();
            formData.append('file', data.file);
            await importLead(formData)
                .then((res: any) => {
                    resolve(res?.data);
                    dispatch(setImportFile(data.file));
                    dispatch(setImportLeadResponse(res?.data));
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    };

    const { data: leadsData, isFetching: isLeadsFetching, isLoading: isLeadsLoading, isError: isLeadsError, error: leadsError } = useGetLeadsQuery(selectedLeadList);

    useEffect(() => {
        if (!leadsListStatusData?.data?.statuses) return;
        const formattedCards = leadsListStatusData?.data?.statuses.map((status, index) => {
            const leadsForStatus = data
                .filter((lead) => lead.status_id === status.id)
                .map((lead) => ({
                    ...lead,
                }));
            return {
                id: status.id,
                title: status.name
                    .toLowerCase()
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '),
                leads: leadsForStatus ?? [],
            };
        });
        setCards(formattedCards);
    }, [data, leadsListStatusData?.data?.statuses, leadsData]);

    const handleUpdateBoardTitle = async (boardId: number, newTitle: string) => {
        // Enforce permission check before updating
        if (!editKanbanPermission) {
            alert("You don't have permission to edit the board title.");
            return;
        }

        if (newTitle.trim() === '') {
            alert('Title cannot be empty');
            return;
        }

        try {
            await updateLeadStatusMutation({ id: boardId, formData: { name: newTitle } });
            const updatedBoards = cards.map((board) => (board.id === boardId ? { ...board, title: newTitle } : board));
            setCards(updatedBoards);
        } catch (error) {
            alert('Failed to update title');
        }
    };

    return (
        <div className="p-6 relative bg-white min-h-[calc(100vh-50px)]">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <div className="flex items-center gap-4  ">
                    <h5 className="font-semibold font-inter text-lg dark:text-black">Leads</h5>

                    {/* Filter Button with Popover */}
                    <Popover width={300} position="bottom-start" shadow="md" opened={filterPopoverOpened} onChange={setFilterPopoverOpened}>
                        <Popover.Target>
                            <button
                                className={` ${
                                    filterPopoverOpened ? 'border-primary border-[2px]' : 'border-1'
                                } relative rounded-md flex items-center justify-between border p-2 gap-3 bg-white/90 hover:bg-white`}
                                id="column-filter-menu-button"
                                aria-expanded={filterPopoverOpened}
                                aria-haspopup="true"
                                onClick={() => setFilterPopoverOpened(!filterPopoverOpened)}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M17.1666 3.41667V5.25C17.1666 5.91667 16.7499 6.75 16.3333 7.16667L12.7499 10.3333C12.2499 10.75 11.9166 11.5833 11.9166 12.25V15.8333C11.9166 16.3333 11.5833 17 11.1666 17.25L9.99995 18C8.91661 18.6667 7.41661 17.9167 7.41661 16.5833V12.1667C7.41661 11.5833 7.08328 10.8333 6.74995 10.4167L6.35828 10.0083C6.09995 9.73333 6.04995 9.31667 6.25828 8.99167L10.5249 2.14167C10.6749 1.9 10.9416 1.75 11.2333 1.75H15.4999C16.4166 1.75 17.1666 2.5 17.1666 3.41667Z"
                                        fill="#101010"
                                    />
                                    <path
                                        d="M8.62504 3.025L5.66671 7.76667C5.38337 8.225 4.73337 8.29167 4.35837 7.9L3.58337 7.08333C3.16671 6.66667 2.83337 5.91667 2.83337 5.41667V3.5C2.83337 2.5 3.58337 1.75 4.50004 1.75H7.91671C8.56671 1.75 8.96671 2.46667 8.62504 3.025Z"
                                        fill="#101010"
                                    />
                                </svg>
                                {activeFiltersCount > 0 && (
                                    <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                                        <Badge size="xs" variant="filled" color="blue" className="ml-1 rounded-full">
                                            {activeFiltersCount}
                                        </Badge>
                                    </div>
                                )}
                            </button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <div className="flex flex-col flex-grow gap-4">
                                <Text size="sm" fw={500} className="mb-2">
                                    Filter Options
                                </Text>

                                <div>
                                    <Text size="xs" className="mb-1 text-gray-600">
                                        Lead List
                                    </Text>
                                    <Select
                                        placeholder="Select Lead List"
                                        data={leadListsOptions}
                                        value={selectedLeadList}
                                        onChange={(value) => {
                                            if (value) {
                                                setSelectedLeadList(value);
                                            }
                                        }}
                                        searchable
                                        nothingFound="No options found"
                                        size="sm"
                                    />
                                </div>

                                {setSelectedSources && (
                                    <div>
                                        <Text size="xs" className="mb-1 text-gray-600">
                                            Sources
                                        </Text>
                                        <MultiSelect
                                            placeholder="Filter by Sources"
                                            data={sourceOptions}
                                            value={selectedSources || []}
                                            onChange={(values) => {
                                                setSelectedSources(values);
                                            }}
                                            searchable
                                            clearable
                                            nothingFound="No sources found"
                                            size="sm"
                                            maxDropdownHeight={200}
                                        />
                                    </div>
                                )}

                                {/* Active Filters Summary */}
                                {(selectedLeadListName || (selectedSources && selectedSources.length > 0)) && (
                                    <div className="pt-2 border-t">
                                        <Text size="xs" className="mb-2 text-gray-600">
                                            Active Filters:
                                        </Text>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedLeadListName && (
                                                <Badge size="sm" variant="light" color="blue">
                                                    List: {selectedLeadListName}
                                                </Badge>
                                            )}
                                            {selectedSources && selectedSources.length > 0 && (
                                                <Badge size="sm" variant="light" color="grape">
                                                    Sources: {selectedSources.length} selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Popover.Dropdown>
                    </Popover>
                </div>
                <input
                    type="text"
                    placeholder="Search Leads"
                    className="py-2 w-80 rounded-md border border-gray-200 bg-gray-50 pl-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="ltr:ml-auto rtl:mr-auto flex gap-4">
                    <Button
                        onClick={() => {
                            setIsKanban(false);
                        }}
                        className="bg-gradient-to-r from-cyan-500 to-cyan-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-semibold px-4 py-5 rounded-xl shadow-md flex items-center gap-2 transition-all duration-300"
                    >
                        List View
                    </Button>
                    <ImportData title={'Leads'} submit={importSubmit} />
                    {addPermission && (
                        <div className="w-full flex items-center justify-between gap-4">
                            <Button
                                onClick={openAddModal}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold px-4 py-5 rounded-xl shadow-md flex items-center gap-2 transition-all duration-300"
                            >
                                Add New Lead
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="relative">
                {/* Loader Overlay */}
                {(fetching || isLeadsFetching || isUpdating || isLeadsListStatusFetching) && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-50 flex items-center justify-center">
                        <Loader size="xl" color="blue" />
                    </div>
                )}

                <ScrumBoard updateBoardTitle={handleUpdateBoardTitle} data={filteredCards} openEditModal={openEditModal} openDeleteModal={openDeleteModal} handleDragEnd={handleDragEnd} />
            </div>
            {/* Modals */}
            <Modal isOpen={isAddModalOpen} close={closeAddModal} size={'max-w-2xl'}>
                <ModalHeader title="Add Lead" />
                <ModalBody>
                    <AddBody close={closeAddModal} />
                </ModalBody>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} close={closeDeleteModal} size={'max-w-2xl'}>
                <ModalBody>
                    <>{selectedLeadId && <DeleteBody close={closeDeleteModal} leadId={selectedLeadId} />}</>
                </ModalBody>
            </Modal>

            <Modal isOpen={isEditModalOpen} close={closeEditModal} size={'max-w-2xl'}>
                <ModalHeader title="Edit Lead" />
                <ModalBody>{selectedLeadId !== null ? <EditBody close={closeEditModal} data={data.find((lead) => lead.id === selectedLeadId) as ILead} /> : <p>No lead selected</p>}</ModalBody>
            </Modal>
        </div>
    );
};

export default LeadsKanban;
