import React, { useCallback, useState } from 'react';
import { Tooltip, Avatar, Badge } from '@mantine/core';
import IconCalendar from '../../../../../_theme/components/Icon/IconCalendar';
import IconEdit from '../../../../../_theme/components/Icon/IconEdit';
import IconTrashLines from '../../../../../_theme/components/Icon/IconTrashLines';
import { ILead } from '../models/lead';
import { MailIcon, Phone } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setDialerOpen, setNumber } from '@/app/slices/dialerSlice';
import { useCreateConversationMutation, useGetConversationsQuery } from '@/app/features/Conversations/services/conversationsApiSlice';
import { useNavigate, useParams } from 'react-router-dom';
import CreateNewChat from '@/app/features/Conversations/components/CreateNewChat';
import { setLeadId } from '@/app/slices/callLogsSlice';

interface BoardCardProps {
    lead: ILead;
    index: number;
    openEditLeadModal: (lead: ILead) => void;
    openDeleteLeadModal: (lead: ILead) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ lead, index, openEditLeadModal, openDeleteLeadModal }) => {
    const [createConversation, { isLoading }] = useCreateConversationMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data } = useGetConversationsQuery();

    const handleStartCall = useCallback(() => {
        dispatch(setNumber(lead.phone) || '');
        dispatch(setDialerOpen(true));
    }, [dispatch, lead.phone]);

    const handleEmailClick = () => {
        if (!lead.email) return;

        const matchingConversation = data?.conversations?.find((conv) => conv?.lead?.email?.toLowerCase() === lead.email.toLowerCase());
        if (matchingConversation) {
            dispatch(setLeadId(matchingConversation?.id));
            navigate('/chats');
        } else {
            createConversation({ leadId: lead.id, name: `${lead.firstName} ${lead.lastName}` })
                .unwrap()
                .then((newConversation) => {
                    dispatch(setLeadId(newConversation.conversation.id));
                    navigate('/chats');
                })
                .catch((error) => {
                    console.error('Failed to create conversation:', error);
                });
        }
    };

    return (
        <div data-lead={lead.id} className="sortable-list">
            <div className="bg-white dark:bg-white-dark/20 p-3 pb-5 rounded-xl mb-5 space-y-3 cursor-move">
                <div className="flex justify-between">
                    <p className="text-base font-medium break-all line-clamp-3 ">
                        {lead.firstName} {lead.lastName}
                    </p>
                    <div className="flex gap-2">
                        <Phone size={14} aria-disabled={!lead.phone} className="cursor-pointer hover:text-primary" onClick={handleStartCall} />
                        {lead.email ? (
                            <MailIcon size={14} className="cursor-pointer hover:text-primary" onClick={handleEmailClick} />
                        ) : (
                            <MailIcon size={14} className="opacity-40 cursor-not-allowed" />
                        )}
                    </div>
                </div>
                <p className="break-all line-clamp-3">{lead.companyName}</p>
                <div className="flex items-center gap-2">
                    {lead.email && (
                        <Tooltip label={lead.email} position="top" withArrow>
                            <Avatar size="xs" color="blue" radius="xl">
                                {lead.email.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    )}
                    {lead.phone && (
                        <Tooltip label={lead.phone} position="top" withArrow>
                            <Avatar size="xs" color="green" radius="xl">
                                {lead.phone.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    )}
                    {lead.jobTitle && (
                        <Tooltip label={lead.jobTitle} position="top" withArrow>
                            <Avatar size="xs" color="orange" radius="xl">
                                {lead.jobTitle.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    )}
                    {lead.websiteUrl && (
                        <Tooltip label={lead.websiteUrl} position="top" withArrow>
                            <Avatar size="xs" color="red" radius="xl">
                                {lead.websiteUrl.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    )}
                    {lead.companyLinkedInUrl && (
                        <Tooltip label={lead.companyLinkedInUrl} position="top" withArrow>
                            <Avatar size="xs" color="purple" radius="xl">
                                {lead.companyLinkedInUrl.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    )}
                    {lead.socialMediaUrl && (
                        <Tooltip label={lead.socialMediaUrl} position="top" withArrow>
                            <Avatar size="xs" color="pink" radius="xl">
                                {lead.socialMediaUrl.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    )}
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {lead.classification && (
                        <Badge
                            className="capitalize"
                            color={lead.classification === 'Hot' ? 'red' : lead.classification === 'Warm' ? 'orange' : 'blue'}
                            variant="filled" // Using filled for better visibility, or light as per preference
                            size="sm" // Might want slightly smaller or same size
                        >
                            {lead.classification}
                        </Badge>
                    )}
                    {lead.status && (
                        <Badge className="capitalize" color={'gray'} variant="light" size="lg">
                            {lead.status.name
                                .split('_')
                                .map((word) => word.toLowerCase())
                                .join(' ')}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="font-medium flex items-center hover:text-primary break-all line-clamp-3">
                        <IconCalendar className="ltr:mr-3 rtl:ml-3 shrink-0" />
                        <span>{lead.jobTitle}</span>
                    </div>
                    <div className="flex items-center">
                        <button onClick={() => openEditLeadModal(lead)} type="button" className="hover:text-info">
                            <IconEdit className="ltr:mr-3 rtl:ml-3" />
                        </button>
                        <button onClick={() => openDeleteLeadModal(lead)} type="button" className="hover:text-danger">
                            <IconTrashLines />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardCard;
