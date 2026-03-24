import React, { forwardRef, useEffect, useMemo } from 'react';
import { useGetLeadsQuery } from '../../LeadManagement/Leads/services/leadsApi';
import { useDisclosure } from '@mantine/hooks';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import { Box, Group, LoadingOverlay, Select, Text } from '@mantine/core';
import { ILead } from '../../LeadManagement/Leads/models/lead';
import AddLeadBody from '../../LeadManagement/Leads/components/forms/AddBody';
import AddLeadListBody from '../../LeadManagement/LeadList/components/forms/AddBody';
import { ItemProps } from '../../../shared/utils/utils';
import IconPlusCircle from '../../../../_theme/components/Icon/IconPlusCircle';
import { useGetCallContactsQuery } from '../../Integrations/services/TwillioApiSlice';
import { setDialerOpen, setNumber } from '../../../slices/dialerSlice';
import { useDispatch } from 'react-redux';
import { useGetLeadsListQuery } from '../../LeadManagement/LeadList/services/leadsListApi';
import { ILeadList } from '../../LeadManagement/LeadList/models/leadsList';
import { CallLog, IConversation } from '../types';
import { clearLeadData, setLeadData } from '@/app/slices/callLogsSlice';
import { Plus } from 'lucide-react';

function LeadForm({
    callLog,
    variant,
    conversation,
    close,
    openNewLead,
    openNewLeadList,
    openedNewLead,
    openedNewLeadList,
    closeNewLead,
    closeNewLeadList,
}: {
    callLog?: CallLog;
    variant: 'callLogItem' | 'button';
    conversation?: IConversation;
    close: () => void;
    openNewLead: () => void;
    openNewLeadList: () => void;
    openedNewLead: boolean;
    openedNewLeadList: boolean;
    closeNewLead: () => void;
    closeNewLeadList: () => void;
}) {
    const dispatch = useDispatch();

    const { data: callsData, isLoading: callsLoading } = useGetCallContactsQuery();
    const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery();
    const { data: leadListData, isLoading: leadListLoading } = useGetLeadsListQuery();

    const leadListOptions = useMemo(
        () => [
            {
                value: '-1',
                label: 'Add New',
                icon: <IconPlusCircle className="text-primary" />,
                description: 'Create a new lead list',
            },
            ...(leadListData?.data?.leadLists.map((leadList: ILeadList) => ({
                value: leadList.id.toString(),
                label: leadList.name,
            })) || []),
        ],
        [leadListData?.data]
    );

    const leadOptions = useMemo(() => {
        const options =
            leadsData?.data?.leads
                .filter((lead: ILead) => !callsData?.contacts?.some((contact) => contact.lead_id === lead.id))
                .map((lead: ILead) => ({
                    value: lead.id.toString(),
                    label: `${lead.firstName} ${lead.lastName ?? ''}`,
                    description: lead.phone,
                    icon: (
                        <span className="text-md w-[44px] h-full  text-center rounded-lg text-green-800/80 font-bold bg-green-200/80 p-3">
                            {lead.firstName?.charAt(0).toUpperCase() + (lead.lastName?.charAt(0).toUpperCase() || '')}
                        </span>
                    ),
                    phone: lead.phone,
                })) || [];
        return [
            {
                value: '-1',
                label: 'Add New',
                icon: <IconPlusCircle className="text-primary" />,
                description: 'Create a new lead',
            },
            ...options,
        ];
    }, [leadsData, callsData]);

    const prefillLeadData = () => {
        if (callLog) {
            dispatch(setLeadData({ phone: callLog.phone || null }));
        }

        if (conversation) {
            dispatch(
                setLeadData({
                    phone: conversation?.client_phone_number || null,
                    email: conversation?.client_email || null,
                    name: conversation?.client_name || null,
                })
            );
        }
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            leadListId: null,
            leadId: null,
            name: '',
        },
        validationSchema: Yup.object({
            leadId: Yup.number().nullable().required('Lead is required').min(1, 'Please select a lead'),
            name: Yup.string(),
        }),
        onSubmit: async (values, { resetForm }) => {
            const formData = {
                leadId: values.leadId ?? -1,
                name: values.name,
            };
            dispatch(setNumber(leadOptions.find((lead) => lead.value === formData.leadId.toString())?.description || ''));
            dispatch(setDialerOpen(true));
            close();
            resetForm();
        },
    });

    useEffect(() => {
        if (validation.values.leadId == -1) {
            openNewLead();
            validation.setFieldValue('leadId', null);
        }
    }, [validation.values.leadId]);

    useEffect(() => {
        if (validation.values.leadListId == -1) {
            openNewLeadList();
            validation.setFieldValue('leadListId', null);
        }
    }, [validation.values.leadListId]);

    const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ label, description, icon, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                {!!icon && icon}
                <div>
                    <Text size="sm">{label}</Text>
                    {description && (
                        <Text size="xs" opacity={0.65}>
                            {description}
                        </Text>
                    )}
                </div>
            </Group>
        </div>
    ));

    return (
        <>
            <Modal isOpen={!openedNewLead && !openedNewLeadList} close={close}>
                <ModalHeader title="New Lead" />
                <ModalBody>
                    <Box pos={'relative'}>
                        <LoadingOverlay visible={leadsLoading || callsLoading} overlayBlur={2} />
                        <form onSubmit={validation.handleSubmit} className="space-y-4">
                            <FormGroup>
                                <FormLabel required htmlFor="leadList">
                                    Lead List
                                </FormLabel>
                                <Select
                                    className={`${validation.touched.leadListId && validation.errors.leadListId ? 'invalid' : ''}`}
                                    data={leadListOptions}
                                    itemComponent={SelectItem}
                                    value={validation.values.leadListId + ''}
                                    onChange={(value) => {
                                        validation.setFieldValue('leadListId', value);

                                        if (value === '-1') {
                                            openNewLeadList();
                                            validation.setFieldValue('leadListId', null);
                                            return;
                                        }

                                        if (variant === 'callLogItem') {
                                            prefillLeadData();
                                            openNewLead();
                                        }
                                    }}
                                    onBlur={validation.handleBlur}
                                    searchable
                                    nothingFound="No lead lists found"
                                    placeholder="Select leads list"
                                    error={validation.touched.leadListId && validation.errors.leadListId}
                                />
                            </FormGroup>
                            {variant === 'button' && validation.values.leadListId && (
                                <FormGroup>
                                    <FormLabel required htmlFor="leads">
                                        Leads
                                    </FormLabel>
                                    <Select
                                        className={`${validation.touched.leadId && validation.errors.leadId ? 'invalid' : ''}`}
                                        itemComponent={SelectItem}
                                        data={leadOptions}
                                        value={validation.values.leadId + ''}
                                        onChange={(value) => {
                                            validation.setFieldValue('leadId', value);
                                        }}
                                        onBlur={validation.handleBlur}
                                        searchable
                                        nothingFound="No leads found"
                                        placeholder="Select leads"
                                        error={validation.touched.leadId && validation.errors.leadId}
                                    />
                                </FormGroup>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700">
                                    Create
                                </button>
                            </div>
                        </form>
                    </Box>
                </ModalBody>
            </Modal>

            <Modal isOpen={openedNewLead && !openedNewLeadList} close={closeNewLead}>
                <ModalHeader title="Add New Lead" />
                <>{<AddLeadBody close={closeNewLead} leadListId={validation.values.leadListId || null} />}</>
            </Modal>

            <Modal isOpen={openedNewLeadList && !openedNewLead} close={closeNewLeadList}>
                <ModalHeader title="Add New Lead List" />
                <ModalBody>{<AddLeadListBody close={closeNewLeadList} />}</ModalBody>
            </Modal>
        </>
    );
}

function CreateNewCall({ callLog, variant, conversation }: { conversation?: IConversation; callLog?: CallLog; variant: 'callLogItem' | 'button' }) {
    const dispatch = useDispatch();

    const [opened, { open, close }] = useDisclosure(false);
    const [openedNewLead, { open: openNewLead, close: closeNewLead }] = useDisclosure(false);
    const [openedNewLeadList, { open: openNewLeadList, close: closeNewLeadList }] = useDisclosure(false);

    useEffect(() => {
        if (!openedNewLead) {
            dispatch(clearLeadData());
        }
    }, [openedNewLead, dispatch]);

    return (
        <>
            {opened && (
                <LeadForm
                    callLog={callLog}
                    variant={variant}
                    conversation={conversation}
                    close={close}
                    openNewLead={openNewLead}
                    openNewLeadList={openNewLeadList}
                    openedNewLead={openedNewLead}
                    openedNewLeadList={openedNewLeadList}
                    closeNewLead={closeNewLead}
                    closeNewLeadList={closeNewLeadList}
                />
            )}

            {variant === 'button' && (
                <button onClick={open} className="flex basis-28 sm:basis-44 justify-center  rounded-md bg-primary  py-2 text-sm font-medium text-white">
                    Create New
                </button>
            )}

            {variant === 'callLogItem' && (
                <div
                    onClick={open}
                    className={`flex items-center justify-center cursor-pointer rounded-lg
    ${callLog ? 'w-10 h-10 bg-blue-100' : 'w-7 h-7 bg-green-100'}
  `}
                >
                    <Plus className={`${callLog ? 'w-6 h-6' : 'w-4 h-4'} text-green-800/80 font-bold`} />
                </div>
            )}
        </>
    );
}

export default CreateNewCall;
