import { Badge, Box, Drawer, Loader, LoadingOverlay, Select, Text, MultiSelect, Menu, Button, NumberInput } from '@mantine/core';
import { FC, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';
import { IRootState } from '../../../store';
import { ILead } from './models/lead';
import AsyncDataTable from '../../../shared/components/datatables/AsyncDataTable';
import DeleteBody from './components/forms/DeleteBody';
import EditBody from './components/forms/EditBody';
import AddBody from './components/forms/AddBody';
import { useDeleteLeadsMutation, useImportLeadMutation } from './services/leadsApi';
import { useDisclosure } from '@mantine/hooks';
import { useGetLeadsListQuery } from '../LeadList/services/leadsListApi';
import Tooltip from '../../../shared/components/ui/Tooltip';
import ViewLeadBody from './components/ViewLeadBody';
import { sourceColors } from './constants/data';
import FacebookLeadGenModal from './components/FacebookLeadGen/FacebookLeadGenModal';
import { useGetIntegrationsQuery } from '../../Integrations/services/IntegrationApi';
import IconFacebookCircle from '../../../../_theme/components/Icon/IconFacebookCircle';
import IconPhone from '../../../../_theme/components/Icon/IconPhone';
import { hasRole } from '../../../shared/utils/utils';
import ImportData from '../../ImportData';
import Delete from '@/app/shared/components/ui/Delete';
import ModalWrapper from '@/app/shared/components/ui/modals/crud-modal/ModalWrapper';
import { showNotification } from '@mantine/notifications';
import { setPowerDialerActive, setCurrentQueueId, setPowerDialerWindowOpen, setDialerOpen } from '@/app/slices/dialerSlice';
import { useStartPowerDialerMutation } from '@/app/features/Integrations/services/TwillioApiSlice';
import { useGetVoicemailDropsQuery } from '@/app/features/Calls/services/voicemailDropApi';
import AssignLeads from './components/AssignLeads';
import BulkMessageModal from './components/BulkMessageModal';
import { setImportFile, setImportLeadResponse } from '@/app/slices/leadSlice';
import CampaignBanner from './components/CampaignBanner';
import CampaignSetupModal from './components/CampaignSetupModal';

interface ILeadsPageProps {
    data: ILead[];
    fetching?: boolean;
    setSelectedLeadList: (leadListId: string) => void;
    selectedLeadList: string;
    setIsKanban: (isKanban: boolean) => void;
    selectedSources?: string[];
    setSelectedSources?: (sources: string[]) => void;
}

export const initialLeadData: ILead = {
    id: -1,
    user_id: -1,
    company_id: -1,
    lead_list_id: -1,
    status_id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: '',
    companyName: '',
    websiteUrl: '',
    jobTitle: '',
    socialMediaUrl: '',
    companyLinkedInUrl: '',
    created_at: '',
    updated_at: '',
    user: {
        id: -1,
        company_id: -1,
        name: '',
        email: '',
        email_verified_at: '',
        roles: [],
    },
    lead_list: {
        id: -1,
        company_id: -1,
        name: '',
        description: '',
        created_at: '',
        updated_at: '',
    },
    status: {
        id: -1,
        leadlist_id: -1,
        name: '',
        created_at: '',
        updated_at: '',
    },
    otherFields: '',
    customField: '',
    customFields: undefined,
};

const LeadsPage: FC<ILeadsPageProps> = ({ data, fetching, setSelectedLeadList, selectedLeadList, setIsKanban, selectedSources, setSelectedSources }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedRows, setSelectedRows] = useState<ILead[]>([]);
    const [selectedLead, setSelectedLead] = useState<ILead>(initialLeadData);
    const [deleteLeads] = useDeleteLeadsMutation();
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isBulkMessageModalOpen, setIsBulkMessageModalOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Leads'));
    }, [dispatch]);

    const [opened, { open, close }] = useDisclosure(false);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure();

    // Permissions
    const auth = useSelector((state: IRootState) => state.auth);
    const isPowerDialerActive = useSelector((state: IRootState) => state.dialer.isPowerDialerActive);
    const addPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Add Lead'));
    const editPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Edit Lead'));
    const deletePermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Delete Lead'));
    const fbConnectPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Connect Facebook Forms'));
    const viewKanbanStatus = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'View Kanban status'));
    const assignLeadListPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Assign Lead List'));

    const [importLead] = useImportLeadMutation();
    const importSubmit = async (data: any): Promise<any> => {
        if (!data) return null;

        const formData = new FormData();
        formData.append('file', data.file);

        try {
            const res = await importLead(formData).unwrap();

            dispatch(setImportFile(data.file));
            dispatch(setImportLeadResponse(res));

            return res;
        } catch (error: any) {
            throw new Error(error?.data?.error || error?.data?.message || error?.message || 'Import failed');
        }
    };

    const [startPowerDialer] = useStartPowerDialerMutation();

    const [isVoicemailModalOpen, setIsVoicemailModalOpen] = useState(false);
    const [selectedVoicemailDropId, setSelectedVoicemailDropId] = useState<number | null>(null);
    const [timeoutSeconds, setTimeoutSeconds] = useState<number | undefined>(30);
    const { data: voicemailDrops } = useGetVoicemailDropsQuery();

    const handleStartPowerDialerPrompt = () => {
        setIsVoicemailModalOpen(true);
        setSelectedVoicemailDropId(null);
    };

    const handleConfirmStartPowerDialer = async () => {
        setIsVoicemailModalOpen(false);
        if (!selectedLeadList || selectedLeadList === 'all') return;
        try {
            const timeout = timeoutSeconds === undefined ? 30 : timeoutSeconds;
            const res = await startPowerDialer({ lead_list_id: +selectedLeadList, voicemail_drop_id: selectedVoicemailDropId, timeout_seconds: timeout }).unwrap();

            showNotification({
                title: 'Power Dialer Started',
                message: `Queued ${res.queued_count || 0} leads. Open the dialer to begin.`,
                color: 'purple',
            });

            dispatch(setPowerDialerActive(true));
            dispatch(setPowerDialerWindowOpen(true));
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error?.data?.message || 'Failed to start Power Dialer',
                color: 'red',
            });
        }
    };

    const columns = [
        { title: 'First Name', accessor: 'firstName', sortable: true },
        { title: 'Last Name', accessor: 'lastName', sortable: true },
        { title: 'Email', accessor: 'email', sortable: true },
        { title: 'Phone', accessor: 'phone', sortable: true },
        {
            title: 'Source',
            accessor: 'source',
            sortable: true,
            render: (row: ILead) => {
                const color = sourceColors[row.source as keyof typeof sourceColors] || 'gray';
                return <Badge color={color}>{row.source}</Badge>;
            },
        },
        {
            title: 'Classification',
            accessor: 'classification',
            sortable: true,
            render: (row: ILead) => {
                const color = row.classification === 'Hot' ? 'red' : row.classification === 'Warm' ? 'orange' : 'blue';
                return row.classification ? (
                    <Badge color={color} variant="filled" size="sm">
                        {row.classification}
                    </Badge>
                ) : <></>;
            },
        },
        { title: 'Company Name', accessor: 'companyName', sortable: true },
        { title: 'Website URL', accessor: 'websiteUrl', sortable: true },
        { title: 'Job Title', accessor: 'jobTitle', sortable: true },
        { title: 'Social Media URL', accessor: 'socialMediaUrl', sortable: true },
        { title: 'Company LinkedIn URL', accessor: 'companyLinkedInUrl', sortable: true },
        {
            title: 'Status',
            accessor: 'status.name',
            sortable: true,
            render: (row: ILead) => {
                return <Badge>{row?.status?.name}</Badge>;
            },
        },
        {
            title: 'Disposition',
            accessor: 'disposition',
            sortable: true,
            render: (row: ILead) => {
                return <span>{row.disposition || 'Empty'}</span>;
            },
        },
    ];

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

    const selectedLeadListName = useMemo(() => {
        const leadList = leadListData?.data.leadLists?.find((list) => list.id + '' === selectedLeadList);
        return leadList?.name || '';
    }, [leadListData, selectedLeadList]);

    const handleSyncFbLeads = async () => {
        openModal();
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) return;
        setIsBulkDeleteModalOpen(true);
    };

    const handleConfirmBulkDelete = async () => {
        if (selectedRows.length === 0) return;

        setIsDeleting(true);

        const payload = {
            leadIds: selectedRows.map((row) => row.id),
        };

        try {
            const response = await deleteLeads(payload).unwrap();
            showNotification({
                title: 'Success',
                message: 'Leads deleted successfully',
                color: 'green',
            });
            setIsBulkDeleteModalOpen(false);
            setSelectedRows([]);
        } catch (error) {
            showNotification({
                title: 'Error',
                message: 'Failed to delete leads',
                color: 'red',
            });
            setIsBulkDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const rightSide = () => {
        return (
            <div className="flex items-center gap-2">
                {viewKanbanStatus && (
                    <Tooltip content="Kanban View">
                        <button className={` border-1 rounded-md flex items-center justify-between border p-2 gap-3 bg-white/90 hover:bg-white`} onClick={() => setIsKanban(true)}>
                            {/* <IconColumns className="text-purple-600 p-0 m-0" /> */}
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M11.1528 1.57311C10.8724 1.28617 10.5374 1.05816 10.1677 0.902487C9.79791 0.746817 9.40076 0.666626 8.99956 0.666626C8.59836 0.666626 8.20121 0.746817 7.83144 0.902487C7.46167 1.05816 7.12675 1.28617 6.84635 1.57311L6.19841 2.23772L5.27129 2.22626C4.86998 2.22151 4.47176 2.29706 4.10006 2.44845C3.72837 2.59984 3.39069 2.82402 3.1069 3.10782C2.8231 3.39161 2.59892 3.72929 2.44753 4.10098C2.29614 4.47268 2.22059 4.8709 2.22534 5.27221L2.23576 6.19933L1.57324 6.84727C1.28629 7.12767 1.05828 7.46259 0.902609 7.83236C0.746939 8.20213 0.666748 8.59928 0.666748 9.00048C0.666748 9.40168 0.746939 9.79883 0.902609 10.1686C1.05828 10.5384 1.28629 10.8733 1.57324 11.1537L2.2368 11.8016L2.22534 12.7287C2.22059 13.1301 2.29614 13.5283 2.44753 13.9C2.59892 14.2717 2.8231 14.6094 3.1069 14.8931C3.39069 15.1769 3.72837 15.4011 4.10006 15.5525C4.47176 15.7039 4.86998 15.7794 5.27129 15.7747L6.19841 15.7643L6.84635 16.4268C7.12675 16.7138 7.46167 16.9418 7.83144 17.0974C8.20121 17.2531 8.59836 17.3333 8.99956 17.3333C9.40076 17.3333 9.79791 17.2531 10.1677 17.0974C10.5374 16.9418 10.8724 16.7138 11.1528 16.4268L11.8007 15.7632L12.7278 15.7747C13.1291 15.7794 13.5274 15.7039 13.8991 15.5525C14.2708 15.4011 14.6084 15.1769 14.8922 14.8931C15.176 14.6094 15.4002 14.2717 15.5516 13.9C15.703 13.5283 15.7785 13.1301 15.7738 12.7287L15.7634 11.8016L16.4259 11.1537C16.7128 10.8733 16.9408 10.5384 17.0965 10.1686C17.2522 9.79883 17.3324 9.40168 17.3324 9.00048C17.3324 8.59928 17.2522 8.20213 17.0965 7.83236C16.9408 7.46259 16.7128 7.12767 16.4259 6.84727L15.7623 6.19933L15.7738 5.27221C15.7785 4.8709 15.703 4.47268 15.5516 4.10098C15.4002 3.72929 15.176 3.39161 14.8922 3.10782C14.6084 2.82402 14.2708 2.59984 13.8991 2.44845C13.5274 2.29706 13.1291 2.22151 12.7278 2.22626L11.8007 2.23668L11.1528 1.57416V1.57311ZM11.4517 7.80669L8.32662 10.9318C8.27824 10.9803 8.22076 11.0188 8.15748 11.0451C8.0942 11.0713 8.02636 11.0848 7.95785 11.0848C7.88934 11.0848 7.82151 11.0713 7.75823 11.0451C7.69495 11.0188 7.63747 10.9803 7.58909 10.9318L6.02653 9.36925C5.9781 9.32082 5.93969 9.26333 5.91348 9.20006C5.88727 9.13678 5.87378 9.06897 5.87378 9.00048C5.87378 8.932 5.88727 8.86418 5.91348 8.80091C5.93969 8.73763 5.9781 8.68014 6.02653 8.63172C6.07496 8.58329 6.13245 8.54488 6.19572 8.51867C6.25899 8.49246 6.32681 8.47897 6.39529 8.47897C6.46378 8.47897 6.5316 8.49246 6.59487 8.51867C6.65814 8.54488 6.71563 8.58329 6.76406 8.63172L7.95785 9.82655L10.7142 7.06916C10.812 6.97135 10.9447 6.91641 11.083 6.91641C11.2213 6.91641 11.3539 6.97135 11.4517 7.06916C11.5495 7.16696 11.6045 7.29961 11.6045 7.43792C11.6045 7.57623 11.5495 7.70888 11.4517 7.80669Z"
                                    fill="#610BFC"
                                />
                            </svg>
                        </button>
                    </Tooltip>
                )}
                {selectedRows.length > 0 && (
                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <button className="btn rounded-lg shadow-none border border-[#7C3AED] text-[#7C3AED] bg-white hover:bg-[#7C3AED]/10 transition-colors">
                                Bulk Actions ({selectedRows.length})
                            </button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item onClick={() => setIsBulkMessageModalOpen(true)}>
                                Send Message
                            </Menu.Item>
                            {!assignLeadListPermission ? (
                                <Tooltip content="Permission Denied. Ask the owner to assign you this permission.">
                                    <div style={{ display: 'inline-block', width: '100%' }}>
                                        <Menu.Item
                                            onClick={() => { }}
                                            disabled={true}
                                        >
                                            Assign Leads
                                        </Menu.Item>
                                    </div>
                                </Tooltip>
                            ) : (
                                <Menu.Item onClick={() => setIsAssignModalOpen(true)}>
                                    Assign Leads
                                </Menu.Item>
                            )}
                            <Menu.Divider />
                            <Menu.Item color="red" onClick={handleBulkDelete}>
                                Delete Leads
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}
                <ModalWrapper
                    headerTitle="Delete Leads"
                    isOpen={isBulkDeleteModalOpen}
                    close={() => setIsBulkDeleteModalOpen(false)}
                    body={<Delete delete={handleConfirmBulkDelete} isDeleting={isDeleting} close={() => setIsBulkDeleteModalOpen(false)} />}
                />
                <ModalWrapper
                    headerTitle="Assign Leads"
                    isOpen={isAssignModalOpen}
                    close={() => setIsAssignModalOpen(false)}
                    body={<AssignLeads leadIds={selectedRows.map((row) => row.id)} close={() => setIsAssignModalOpen(false)} onSuccess={() => setSelectedRows([])} />}
                />
                <BulkMessageModal
                    isOpen={isBulkMessageModalOpen}
                    close={() => setIsBulkMessageModalOpen(false)}
                    selectedLeads={selectedRows}
                    onSuccess={() => setSelectedRows([])}
                />
                <ModalWrapper
                    headerTitle="Start Power Dialer"
                    isOpen={isVoicemailModalOpen}
                    close={() => setIsVoicemailModalOpen(false)}
                    body={
                        <div className="flex flex-col gap-4 p-4">
                            <Text size="sm">Select a Voicemail Drop recording to use for this dialing session (Optional).</Text>
                            <Select
                                placeholder="None (Don't use Voicemail Drop)"
                                data={[{ value: '', label: 'None' }, ...(voicemailDrops?.data?.map(d => ({ value: d.id.toString(), label: d.name })) || [])]}
                                value={selectedVoicemailDropId?.toString() || ''}
                                onChange={(val) => setSelectedVoicemailDropId(val ? parseInt(val) : null)}
                            />

                            <Text size="sm" className="mt-2">Dialing Timeout (Seconds)</Text>
                            <NumberInput
                                placeholder="30"
                                value={timeoutSeconds}
                                onChange={setTimeoutSeconds}
                                min={10}
                                max={60}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" color="red" onClick={() => setIsVoicemailModalOpen(false)}>Cancel</Button>
                                <Button color="green" onClick={handleConfirmStartPowerDialer}>Start Dialing</Button>
                            </div>
                        </div>
                    }
                />

                {selectedRows.length === 0 && (
                    <>
                        <ImportData title={'Leads'} submit={importSubmit} />
                        {fbConnectPermission && (
                            <Tooltip
                                content={
                                    !loadingIntegrations && (!socialsData?.socails?.facebook?.fb_page_token || !socialsData?.socails?.facebook?.fb_page_id)
                                        ? 'Connect FB Page to sync leads'
                                        : 'Connect Lead Generation Form'
                                }
                            >
                                <button
                                    /** */
                                    disabled={!socialsData?.socails?.facebook?.fb_page_token || !socialsData?.socails?.facebook?.fb_page_id}
                                    className={` border-1 min-h-[38px] rounded-lg flex items-center justify-between border p-2 gap-3 bg-[#2563EB] text-white disabled:opacity-50 disabled:cursor-not-allowed px-3`}
                                    onClick={handleSyncFbLeads}
                                >
                                    <IconFacebookCircle className="text-white" />
                                    <span className="text-xs font-[500]">Connect FB Form</span>
                                </button>
                            </Tooltip>
                        )}
                    </>
                )}
                {selectedLeadList && selectedLeadList !== 'all' && (
                    <>
                        {isPowerDialerActive ? (
                            <button
                                className="btn rounded-lg shadow-none text-white px-4 bg-red-500 hover:bg-red-600"
                                onClick={() => {
                                    dispatch(setPowerDialerActive(false));
                                    dispatch(setCurrentQueueId(null));
                                    dispatch(setDialerOpen(false));
                                }}
                            >
                                Stop Power Dialer
                            </button>
                        ) : (
                            <button
                                className="btn rounded-lg shadow-none text-white px-4"
                                style={{ backgroundColor: '#22c55e' }}
                                onClick={handleStartPowerDialerPrompt}
                            >
                                Power Dial
                            </button>
                        )}
                        <button
                            className="btn rounded-lg shadow-none text-white px-4"
                            style={{ backgroundColor: '#7C3AED' }}
                            onClick={() => setIsCampaignModalOpen(true)}
                        >
                            {selectedRows.length > 0 && selectedRows.length < (data?.length || 0) ? 'Send via Campaign' : 'Setup Campaign'}
                        </button>
                    </>
                )}
            </div>
        );
    };

    const filterBody = (
        <div className="flex flex-col flex-grow p-4 gap-4">
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
            {(selectedLeadList || (selectedSources && selectedSources.length > 0)) && (
                <div className="pt-2 border-t w-full">
                    <Text size="xs" className="mb-2 text-gray-600">
                        Active Filters:
                    </Text>
                    <div className="flex flex-wrap gap-1">
                        {selectedLeadList && (
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
    );

    const handleRowClick = async (row: ILead): Promise<void> => {
        if (row) {
            setSelectedLead(
                data?.find((item) => item.id === row.id) ?? {
                    ...initialLeadData,
                    id: row.id,
                }
            );
            openDrawer();
        }
    };

    const [openedSyncLead, { open: openModal, close: closeModal }] = useDisclosure(false);

    const { data: socialsData, isFetching: loadingIntegrations } = useGetIntegrationsQuery();

    const makeCallPermission = useMemo(() => {
        return hasRole('Make Call', true, auth);
    }, [auth]);

    const additionalMenuItems = (row: ILead) => (
        <>
            {makeCallPermission && row.phone && (
                <Menu.Item
                    onClick={() => {
                        // Set the lead data in state for calls
                        setSelectedLead(row);
                        // Navigate to calls page with lead data
                        navigate('/calls', { state: { phone: row.phone } });
                    }}
                    icon={<IconPhone />}
                    color="green"
                >
                    Call
                </Menu.Item>
            )}
            {/* <Menu.Item onClick={() => {}} icon={<IconMessage />} color="blue">
                Chat
            </Menu.Item> */}
        </>
    );

    return (
        <>
            <Box pos={'relative'}>
                <LoadingOverlay visible={leadListFetching} zIndex={1000} overlayBlur={1} />
                <FacebookLeadGenModal opened={openedSyncLead} close={closeModal} selectedLeadList={selectedLeadList} />
                <CampaignSetupModal
                    isOpen={isCampaignModalOpen}
                    close={() => setIsCampaignModalOpen(false)}
                    leadListId={selectedLeadList}
                    leads={selectedRows.length > 0 && selectedRows.length < (data?.length || 0) ? selectedRows : (data ?? [])}
                    isTargeted={selectedRows.length > 0 && selectedRows.length < (data?.length || 0)}
                />
            </Box>

            <CampaignBanner leadListId={selectedLeadList} />

            <AsyncDataTable
                addPermission={!!addPermission}
                editPermission={!!editPermission}
                deletePermission={!!deletePermission}
                className="mt-6"
                serial={false}
                multiActions={true}
                title="Leads"
                modalTitle="Lead"
                columns={columns}
                searchData
                data={data ?? []}
                handleSetSelectedData={(lead: ILead) => setSelectedLead(data?.find((item) => item.id === lead.id) ?? initialLeadData)}
                addTitle={'Add Lead'}
                fetching={fetching}
                opened={opened}
                open={open}
                close={close}
                AddBody={<AddBody close={close} leadListId={selectedLeadList ? +selectedLeadList : null} />}
                EditBody={<EditBody data={selectedLead} close={close} />}
                DeleteBody={<DeleteBody leadId={selectedLead?.id} close={close} />}
                leftSide={undefined}
                rightSide={rightSide}
                handleRowClick={handleRowClick}
                view={(id: number) => {
                    setSelectedLead(data?.find((item) => item.id === id) ?? initialLeadData);
                    openDrawer();
                }}
                filterBody={filterBody}
                additionalMenuItems={additionalMenuItems}
                minHeight={400}
                onSelectionChange={(rows) => setSelectedRows(rows)}
                selection={selectedRows}
            />

            <Drawer className="" position="right" opened={drawerOpened} onClose={closeDrawer} padding="xl" size="xl">
                {selectedLead && selectedLead.id !== -1 ? (
                    <ViewLeadBody lead={selectedLead} />
                ) : (
                    <Box className="flex items-center justify-center h-full">
                        <Loader size="lg" color="purple" variant="dots" />
                    </Box>
                )}
            </Drawer>
        </>
    );
};

export default LeadsPage;
