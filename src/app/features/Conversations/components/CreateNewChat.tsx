import React, { forwardRef, useEffect } from 'react';
import { useGetLeadsQuery } from '../../LeadManagement/Leads/services/leadsApi';
import { useCreateConversationMutation, useGetConversationsQuery } from '../services/conversationsApiSlice';
import { useDisclosure } from '@mantine/hooks';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import { Box, Group, LoadingOverlay, Select, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useGetLeadsListQuery } from '../../LeadManagement/LeadList/services/leadsListApi';
import { useMemo } from 'react';
import { ILead } from '../../LeadManagement/Leads/models/lead';
import { ILeadList } from '../../LeadManagement/LeadList/models/leadsList';
import { IConversation } from '../../Calls/models/calls';
import AddLeadBody from '../../LeadManagement/Leads/components/forms/AddBody';
import AddLeadListBody from '../../LeadManagement/LeadList/components/forms/AddBody';
import { ItemProps } from '../../../shared/utils/utils';
import IconPlusCircle from '../../../../_theme/components/Icon/IconPlusCircle';
import { Mail, MailIcon } from 'lucide-react';
interface CreateNewChatProps {
    variant: string;
    forceOpen?: boolean;
    onClose?: () => void;
    initialPhone?: string;
}

function CreateNewChat({ variant, forceOpen, onClose, initialPhone }: CreateNewChatProps) {
    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            leadListId: null,
            leadId: null,
            name: '',
        },
        validationSchema: Yup.object({
            leadListId: Yup.number().nullable().required('Lead List is required').min(1, 'Please select a lead list'),
            leadId: Yup.number().nullable().required('Lead is required').min(1, 'Please select a lead'),
            name: Yup.string(),
        }),
        onSubmit: async (values, { resetForm }) => {
            const formData = {
                leadId: values.leadId ?? -1,
                name: values.name,
            };
            await createConversation(formData)
                .unwrap()
                .then((response) => {
                    showNotification({
                        title: 'Success!',
                        message: response.message || 'Conversation created successfully.',
                        color: 'green',
                    });
                    resetForm();
                    handleClose();
                })
                .catch((error) => {
                    console.error('Error creating conversation:', error);
                    showNotification({
                        title: 'Error!',
                        message: error?.data?.message || 'Failed to create conversation. Please try again later.',
                        color: 'red',
                    });
                });
        },
    });

    const [createConversation, { isLoading }] = useCreateConversationMutation();
    const { data: conversationData, isLoading: conversationsLoading } = useGetConversationsQuery();
    const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery(validation?.values?.leadListId ?? -1, {
        skip: !validation?.values?.leadListId,
    });
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
                ?.filter((lead: ILead) => !conversationData?.conversations?.some((conversation: IConversation) => conversation.lead_id === lead.id))
                .map((lead: ILead) => ({
                    value: lead.id.toString(),
                    label: `${lead.firstName} ${lead.lastName ? lead.lastName : ''}`,
                    description: lead.email,
                    icon: (
                        <span className="text-md rounded-lg text-green-800/80 font-bold bg-green-200/80 p-3">
                            {lead.firstName?.charAt(0).toUpperCase() + (lead.lastName ? lead.lastName.charAt(0).toUpperCase() : '')}
                        </span>
                    ),
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
    }, [leadsData]);

    const [opened, { open, close }] = useDisclosure(false);

    const [openedNewLead, { open: openNewLead, close: closeNewLead }] = useDisclosure(false);

    const [openedNewLeadList, { open: openNewLeadList, close: closeNewLeadList }] = useDisclosure(false);

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

    useEffect(() => {
        if (forceOpen) {
            open();
        }
    }, [forceOpen]);

    const handleClose = () => {
        close();
        onClose?.();
    };

    return (
        <>
            <Modal isOpen={opened && !openedNewLead && !openedNewLeadList} close={handleClose}>
                <ModalHeader title="New Chat" />
                <ModalBody>
                    <Box pos={'relative'}>
                        <LoadingOverlay visible={isLoading || leadListLoading || leadsLoading || conversationsLoading} overlayBlur={2} />
                        <form onSubmit={validation.handleSubmit} className="space-y-4">
                            <FormGroup>
                                <FormLabel required htmlFor="leadList">
                                    Lead List
                                </FormLabel>
                                <Select
                                    itemComponent={SelectItem}
                                    className={`${validation.touched.leadListId && validation.errors.leadListId ? 'invalid' : ''}`}
                                    data={leadListOptions}
                                    value={validation.values.leadListId + ''}
                                    onChange={(value) => {
                                        validation.setFieldValue('leadListId', value);
                                    }}
                                    onBlur={validation.handleBlur}
                                    searchable
                                    nothingFound="No lead lists found"
                                    placeholder="Select lead list"
                                    error={validation.touched.leadListId && validation.errors.leadListId}
                                />
                            </FormGroup>
                            {validation.values.leadListId && (
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
                                    onClick={handleClose}
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
                <>{<AddLeadBody close={() => {
                    closeNewLead();
                    // Force refresh of conversations list to reflect the name change
                    window.location.reload();
                }} leadListId={validation.values.leadListId ?? undefined} initialPhone={initialPhone} />}</>
            </Modal>

            <Modal isOpen={openedNewLeadList && !openedNewLead} close={closeNewLeadList}>
                <ModalHeader title="Add New Lead List" />
                <ModalBody>{<AddLeadListBody close={closeNewLeadList} />}</ModalBody>
            </Modal>
            {variant === 'button' && (
                <button onClick={open} disabled={conversationsLoading} className="flex basis-28 sm:basis-44 justify-center  rounded-md bg-primary  py-2 text-sm font-medium text-white">
                    {leadsLoading ? 'Loading Leads...' : 'Create New'}
                </button>
            )}
        </>
    );
}

export default CreateNewChat;
