import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import ConversationsList from './ConversationsList';
import ConversationView from './ConversationView';

import { useGetConversationsQuery, useReadConversationMutation, useReloadConversationMutation } from '../services/conversationsApiSlice';
import { LoadingOverlay } from '@mantine/core';
import { IConversation, IMessage } from '../models/conversation';
import CreateNewChat from './CreateNewChat';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IRootState } from '@/app/store';
import { useGetUserMutation } from '../../Authentication/services/authApi';
import { clearLeadId } from '@/app/slices/callLogsSlice';
import { useDispatch } from 'react-redux';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import backendApiAddress from '../../../shared/config/address';

export default function ConversationsLayout() {
    const dispatch = useDispatch();
    const { leadId } = useSelector((state: IRootState) => state.callLogs);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
    const { data, refetch, isLoading } = useGetConversationsQuery();
    const [reloadMessages, { isLoading: isLoadingConversations }] = useReloadConversationMutation();
    const [readConversation] = useReadConversationMutation();
    const [searchParams] = useSearchParams();
    const ParamConversationID = searchParams.get('id');
    const [authData] = useGetUserMutation();
    const auth = useSelector((state: IRootState) => state.auth);
    const authEmail = auth?.user?.email_configuration?.username;
    const companyId = auth?.user?.company?.id;
    const authToken = auth?.token ?? localStorage.getItem('authToken') ?? '';

    // Real-time messages received via WebSocket
    const [realtimeMessages, setRealtimeMessages] = useState<IMessage[]>([]);
    const echoRef = useRef<Echo<'reverb'> | null>(null);

    // @ts-ignore
    window.Pusher = Pusher;

    // Set up Echo WebSocket connection
    useEffect(() => {
        if (!authToken || !companyId) return;

        // @ts-ignore
        echoRef.current = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY || '00yvcmmf59icia963gl5',
            wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
            wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
            wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
            forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: `${backendApiAddress}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: 'application/json',
                },
            },
        });

        const channelName = `company.${companyId}.messages`;
        const channel = echoRef.current.private(channelName);

        channel.listen('.New.Conversation.Message', (data: any) => {
            console.log('[REALTIME] New message received via WebSocket', data);

            const newMessage: IMessage = {
                id: data.id,
                conversation_id: data.conversation_id,
                channel_id: data.channel_id,
                message_id: null,
                direction: data.direction,
                recipient: data.recipient,
                sender: data.sender,
                subject: data.subject || '',
                body: data.body,
                status: data.status,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };

            setRealtimeMessages((prev) => [...prev, newMessage]);

            // Also refetch the conversations list to update sidebar
            refetch();
        });

        return () => {
            channel.stopListening('.New.Conversation.Message');
            echoRef.current?.leave(channelName);
            echoRef.current?.disconnect();
            echoRef.current = null;
        };
    }, [authToken, companyId]);

    const conversations = useMemo(() => {
        if (!data?.conversations) return [];
        if (!selectedConversationId && data.conversations.length > 0) setSelectedConversationId(ParamConversationID ? Number(ParamConversationID) : null);

        return data.conversations.map((conversation) => ({
            ...conversation,
            name: conversation.name || conversation.lead.firstName + ' ' + (conversation.lead.lastName ?? '') || 'Unnamed Conversation',
        }));
    }, [data?.conversations, ParamConversationID]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };

        // Initial check
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function handleSelectConversation(id: number) {
        setSelectedConversationId(id);

        // Mark conversation as read when selected
        const conversation = conversations.find((c) => c.id === id);
        if (conversation && !conversation.read) {
            markConversationAsRead(conversation.id);
        }

        if (isMobile) {
            setMobileView('chat');
        }
    }

    const handleBackToList = () => {
        if (isMobile) {
            setMobileView('list');
        }
    };

    function markConversationAsRead(conversationId: number): void {
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation) {
            conversation.read = 1;
        }
    }
    async function getAllConversations(): Promise<IMessage[]> {
        if (!selectedConversationId) return [];

        try {
            console.log('[EMAIL RECEIVE] Frontend - Fetching conversation messages', {
                conversation_id: selectedConversationId,
                timestamp: new Date().toISOString()
            });

            readConversation(selectedConversationId).then(() => {
                refetch();
            });

            const response = await reloadMessages(selectedConversationId).unwrap();

            if (response.success) {
                const emailMessages = response.messages.filter((msg: IMessage) => {
                    const conversation = conversations.find(c => c.id === selectedConversationId);
                    return conversation?.channels.some(ch => ch.id === msg.channel_id && ch.name === 'EMAIL');
                });

                if (emailMessages.length > 0) {
                    console.log('[EMAIL RECEIVE] Frontend - Email messages loaded', {
                        conversation_id: selectedConversationId,
                        total_messages: response.messages.length,
                        email_messages: emailMessages.length,
                        latest_email: emailMessages[emailMessages.length - 1]
                    });
                }

                return response.messages;
            } else {
                console.error('Failed to reload messages:', response.message);
                return [];
            }
        } catch (error) {
            console.error('Error reloading messages or marking as read:', error);
            return [];
        }
    }

    function getConversationsByPlatform(platform: string): IConversation[] {
        if (platform === 'All Inboxes') {
            return conversations;
        }
        return conversations.filter((c) => c.channels.some((channel) => channel.name === platform));
    }

    function searchConversations(query: string): IConversation[] {
        if (!query) return conversations;

        const lowerCaseQuery = query.toLowerCase();
        return conversations.filter((conversation) => conversation.name.toLowerCase().includes(lowerCaseQuery) || conversation.latest_message?.body.toLowerCase().includes(lowerCaseQuery));
    }

    function markConversationAsUnread(conversationId: number): void {
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation) {
            conversation.read = 0;
        }
    }

    function getUnreadCount(): number {
        return conversations.filter((c) => !c.read).length;
    }

    useEffect(() => {
        if (leadId) {
            setSelectedConversationId(leadId);
            dispatch(clearLeadId());
        }
    }, [leadId]);

    return (
        <div className="flex h-[calc(100vh-64px)] min-h-[600px] w-full flex-col overflow-hidden p-4 gap-6 pt-8 container">
            <LoadingOverlay visible={isLoading} overlayBlur={2} />
            {/* Header */}
            <div className="flex items-center justify-between ">
                <div>
                    <div className="flex items-center gap-4">
                        <span className="w-[16px] rounded-[4px]  h-[30px] bg-primary"></span>
                        <h1 className="text-xl font-semibold">Conversations</h1>
                    </div>
                    {authEmail && <p className="text-xsm text-gray-500 ml-[33px]">Connected Email: {authEmail}</p>}
                </div>
                <CreateNewChat variant="button" />
            </div>

            {/* Main content */}
            <div className="rounded-2xl flex flex-grow overflow-hidden shadow-md">
                <div className={`${isMobile && mobileView === 'chat' ? 'hidden' : 'flex'} w-full sm:max-w-[380px] flex-col border-r border-gray-200 md:w-[380px] p-4 bg-white h-full`}>
                    <ConversationsList conversations={conversations ?? []} selectedConversationId={leadId ?? selectedConversationId} onSelectConversation={handleSelectConversation} />
                </div>

                <div className={`${isMobile && mobileView === 'list' ? 'hidden' : 'flex'} flex-grow flex-col`}>
                    <ConversationView
                        conversations={conversations ?? []}
                        selectedConversationId={leadId ?? selectedConversationId}
                        onBackClick={handleBackToList}
                        isMobile={isMobile}
                        conversationMessages={getAllConversations}
                        isLoading={isLoadingConversations}
                        realtimeMessages={realtimeMessages}
                        refetch={async () => {
                            return getAllConversations();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
