import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlatformSelector from './PlatformSelector';
import { getInitials } from '../../../shared/utils/utils';
import { IConversation, IMessage } from '../models/conversation';
import { useCreateConversationChannelMutation, useGetConversationChannelsQuery, useGetConversationsQuery, useSendMessageMutation, useToggleAIMutation } from '../services/conversationsApiSlice';
import RenderMessage from './RenderMessage';
import ChatSkeleton from '../../../shared/components/ui/loaders/ChatSkeleton';
import IconRefresh from '../../../../_theme/components/Icon/IconRefresh';
import { useGetIntegrationsQuery } from '../../Integrations/services/IntegrationApi';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { setDialerOpen, setNumber } from '@/app/slices/dialerSlice';
import { useDispatch } from 'react-redux';
import { Phone, Send } from 'lucide-react';
import { Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import AddLeadBody from '../../LeadManagement/Leads/components/forms/AddBody';
import CreateNewChat from './CreateNewChat';
import { useDisclosure } from '@mantine/hooks';

interface ConversationViewProps {
    conversations: IConversation[];
    conversationMessages: () => Promise<IMessage[]>;
    selectedConversationId: number | null;
    onBackClick: () => void;
    isMobile: boolean;
    isLoading: boolean;
    realtimeMessages?: IMessage[];
    refetch: () => Promise<IMessage[]>;
}

export default function ConversationView({ selectedConversationId, onBackClick, isMobile, isLoading, conversations, conversationMessages, realtimeMessages = [], refetch }: ConversationViewProps) {
    const dispatch = useDispatch();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [openedAddLead, { open: openAddLead, close: closeAddLead }] = useDisclosure(false);

    const { data: platformData, isLoading: isLoadingPlatform } = useGetConversationChannelsQuery(selectedConversationId!, {
        skip: selectedConversationId === null,
    });
    const auth = useSelector((state: IRootState) => state.auth);
    const { data } = useGetConversationsQuery();
    const platformUserContact = platformData?.channels?.find((ch) => ch?.name === 'EMAIL')?.user_contact;
    const selectedConversation = useMemo(() => {
        return data?.conversations?.find((conv) => conv.id === selectedConversationId);
    }, [data, selectedConversationId]);
    const leadEmail = useMemo(() => {
        return selectedConversation?.lead?.email;
    }, [selectedConversation?.lead?.email]);
    const cannotContinueConversation = useMemo(() => {
        const authEmail = auth?.user?.email_configuration?.username;
        return authEmail !== platformUserContact;
    }, [platformData, auth?.user?.email_configuration?.username]);
    const emailChannel = selectedConversation?.channels?.find((ch) => ch?.name === 'EMAIL');
    const leadMatched = useMemo(() => {
        return leadEmail === emailChannel?.lead_contact;
    }, [selectedConversation?.channels, leadEmail]);

    const [createConversationChannel, { isLoading: isLoadingCreateChannel }] = useCreateConversationChannelMutation();
    const handleCreateChannel = async (channel: 'SMS' | 'EMAIL') => {
        if (!selectedConversationId) return;

        try {
            await createConversationChannel({ conversationId: selectedConversationId, channel }).unwrap();
            // refetch();
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    };
    const { data: socialsData, isFetching } = useGetIntegrationsQuery();
    const email = useMemo(() => socialsData?.socails?.email?.username, [socialsData]);
    const phoneNumber = useMemo(() => socialsData?.socails?.twilioPhoneNumber?.phoneNumber, [socialsData]);

    const platformOptions = useMemo(() => {
        if (!platformData) return [];

        let options = platformData.channels.map((channel) => ({
            id: channel.id,
            name: channel.name,
        }));
        // Check SMS if Twillio Number is Connected but no Sms in options
        if (phoneNumber && !options.some((option) => option.name === 'SMS')) {
            handleCreateChannel('SMS');
        }
        // Check Email if Email is Connected
        if (email && !options.some((option) => option.name === 'EMAIL')) {
            handleCreateChannel('EMAIL');
        }
        return options;
    }, [platformData, selectedConversationId, phoneNumber, email]);

    // const conversation = useMemo(() => getMessagesByConversation(selectedConversationId), [selectedConversationId, conversations]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    useEffect(() => {
        setSelectedPlatform(undefined);
        conversationMessages().then((msgs) => {
            setMessages(msgs);
        });
    }, [selectedConversationId]);

    // Append real-time messages to the current conversation
    useEffect(() => {
        if (!selectedConversationId || realtimeMessages.length === 0) return;

        const newMsgs = realtimeMessages.filter(
            (msg) => msg.conversation_id === selectedConversationId && !messages.some((m) => m.id === msg.id)
        );

        if (newMsgs.length > 0) {
            setMessages((prev) => [...prev, ...newMsgs]);
        }
    }, [realtimeMessages, selectedConversationId]);

    const refetchMessages = async () => {
        refetch().then((msgs) => {
            setMessages(msgs);
        });
    };

    const [replyText, setReplyText] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [isEditingSubject, setIsEditingSubject] = useState(false);
    const [originalSubject, setOriginalSubject] = useState('');
    const [showPlatformMenu, setShowPlatformMenu] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<number>();
    const selectedChannelName = useMemo(() => {
        if (!selectedConversation?.channels || !selectedPlatform) return null;

        const channel = selectedConversation.channels.find((ch) => ch.id === selectedPlatform);

        return channel?.name || null;
    }, [selectedConversation, selectedPlatform]);

    const handlePlatformSelect = (platform: number) => {
        setSelectedPlatform(platform);
        setShowPlatformMenu(false);
    };

    // Smart Counter Helper for SMS
    const isGSM7 = (text: string) => {
        const gsm7Regex = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}\[\]~|€!#"¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà ]*$/;
        return gsm7Regex.test(text);
    };

    const smsEncodingInfo = useMemo(() => {
        const textToMeasure = replyText;
        const length = textToMeasure.length;
        const gsm = isGSM7(textToMeasure);

        let segments = 1;
        let perSegment = 160;

        if (gsm) {
            perSegment = 160;
            segments = length <= 160 ? 1 : Math.ceil(length / 153);
        } else {
            perSegment = 70;
            segments = length <= 70 ? 1 : Math.ceil(length / 67);
        }

        return {
            length,
            segments,
            isGSM: gsm,
            perSegment,
            isAtLimit: length >= 1600
        };
    }, [replyText]);

    useEffect(() => {
        if (selectedChannelName === 'EMAIL' && selectedPlatform) {
            const emailMessages = messages.filter((m) => m.channel_id === selectedPlatform && m.subject && m.subject.trim() !== '');
            if (emailMessages.length > 0) {
                const lastSubject = emailMessages[emailMessages.length - 1].subject;
                if (lastSubject) {
                    const finalSubject = lastSubject.toLowerCase().startsWith('re:') ? lastSubject : `Re: ${lastSubject}`;
                    setEmailSubject(finalSubject);
                    setOriginalSubject(finalSubject);
                    setIsEditingSubject(false);
                    return;
                }
            }
            setEmailSubject('');
            setOriginalSubject('');
            setIsEditingSubject(true);
        } else {
            setEmailSubject('');
            setOriginalSubject('');
            setIsEditingSubject(false);
        }
    }, [selectedChannelName, selectedPlatform, messages]);

    const [sendConversationMessage] = useSendMessageMutation();

    function sendMessage(selectedConversationId: number, text: string, platform: number): IMessage | void {
        const channelName = platformOptions.find((ch) => ch.id === platform)?.name;

        let dynamicSubject = 'Team Dakia';
        if (channelName === 'EMAIL') {
            if (!emailSubject.trim()) {
                showNotification({ title: 'Error', message: 'Subject is mandatory for emails', color: 'red' });
                return;
            }
            dynamicSubject = emailSubject;
        }

        let id = -Date.now();

        console.log('[EMAIL SEND] Frontend - Preparing to send message', {
            conversation_id: selectedConversationId,
            channel_id: platform,
            channel_name: channelName,
            message_length: text.length,
            timestamp: new Date().toISOString()
        });

        const newMessage: IMessage = {
            id: id, // Temporary ID, replace with actual ID from API response
            conversation_id: selectedConversationId,
            channel_id: platform,
            message_id: null,
            direction: 'OUTBOUND',
            recipient: '',
            sender: '',
            subject: dynamicSubject,
            body: text,
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // API CALL
        sendConversationMessage({
            conversationId: selectedConversationId,
            body: text,
            channelId: platform,
            subject: dynamicSubject,
        })
            .unwrap()
            .then((res) => {
                if (channelName === 'EMAIL') {
                    console.log('[EMAIL SEND] Frontend - Email sent successfully', {
                        conversation_id: selectedConversationId,
                        message_id: res.data.message.id,
                        status: 'SENT'
                    });
                }
                setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === id ? { ...msg, ...res.data.message, status: 'SENT' } : msg)));
            })
            .catch((error) => {
                if (channelName === 'EMAIL') {
                    console.error('[EMAIL SEND] Frontend - Failed to send email', {
                        conversation_id: selectedConversationId,
                        error: error?.message || 'Unknown error',
                        error_details: error
                    });
                } else {
                    console.error('Error sending message:', error);
                }

                setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === id ? { ...msg, status: 'FAILED' } : msg)));
            });

        return newMessage;
    }

    const conversationRef = useRef<HTMLDivElement>(null);
    const handleStartCall = useCallback(() => {
        dispatch(setNumber(selectedConversation?.lead?.phone ?? ''));
        dispatch(setDialerOpen(true));
    }, [dispatch, selectedConversation]);

    const handleScrollConversationToBottom = () => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    };

    const handleResendMessage = (failedMessage: IMessage) => {
        const tempId = -Date.now();

        setMessages((prev) => prev.map((msg) => (msg.id === failedMessage.id ? { ...msg, status: 'PENDING', id: tempId } : msg)));

        sendConversationMessage({
            conversationId: failedMessage.conversation_id,
            body: failedMessage.body,
            channelId: failedMessage.channel_id,
            subject: failedMessage.subject || 'Team Dakia',
        })
            .unwrap()
            .then((res) => {
                setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...res.data.message } : msg)));
            })
            .catch(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...failedMessage, status: 'FAILED' } : msg)));
            });
    };

    const [toggleAI] = useToggleAIMutation();
    const [isAIEnabled, setIsAIEnabled] = useState(false); // Default to false (User must manually enable)

    const handleToggleAI = async () => {
        if (!selectedConversationId) return;
        try {
            const res = await toggleAI(selectedConversationId).unwrap();
            setIsAIEnabled(res.ai_enabled);
            showNotification({ title: 'Success', message: `AI ${res.ai_enabled ? 'Enabled' : 'Disabled'}`, color: 'green' });
        } catch (error) {
            console.error('Failed to toggle AI:', error);
            showNotification({ title: 'Error', message: 'Failed to toggle AI', color: 'red' });
        }
    };

    // Effect when new message / conversation is changed we scroll to end of the conversation
    useEffect(() => {
        handleScrollConversationToBottom();
    }, [messages, selectedConversationId]);

    if (!selectedConversationId) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <p className="text-gray-500">Select a conversation to view messages</p>
            </div>
        );
    }

    return (
        <div className="flex flex-grow max-h-[calc(100%-0px)] w-full flex-col bg-white">
            {/* Chat header */}

            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
                {isMobile && (
                    <button className="mr-1 text-gray-500" onClick={onBackClick}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
                <div className="flex justify-between items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                        {/* Clickable Avatar to Add Lead */}
                        <div
                            onClick={openAddLead}
                            className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100 text-purple-600 cursor-pointer hover:bg-purple-200"
                            title="Add as Lead"
                        >
                            <span className="text-sm font-medium">{getInitials(conversations.find((c) => c.id === selectedConversationId)?.name || 'User')}</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium">{conversations.find((c) => c.id === selectedConversationId)?.name || 'User'}</h2>
                        </div>

                        <CreateNewChat
                            variant="modal"
                            forceOpen={openedAddLead}
                            onClose={closeAddLead}
                            initialPhone={
                                selectedConversation?.name?.startsWith('+') ? selectedConversation.name : ''
                            }
                        />
                    </div>
                    <div className="flex gap-4 items-center">
                        {/* Toggle AI Button - Only for Missed Call / SMS conversations */}
                        {selectedChannelName === 'SMS' && (
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isAIEnabled}
                                        onChange={handleToggleAI}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    <span className="ml-2 text-sm font-medium text-gray-900">AI</span>
                                </label>
                            </div>
                        )}

                        <button onClick={refetchMessages} className={`transition-transform ${isLoading ? 'animate-spin' : ''}`} disabled={isLoading}>
                            <IconRefresh />
                        </button>
                        <Tooltip
                            label={!selectedConversation?.lead?.phone ? 'No contact found for this lead' : ''}
                            withArrow
                            position="top"
                            color="#610BFC"
                            disabled={!!selectedConversation?.lead?.phone}
                        >
                            <button
                                type="button"
                                disabled={!selectedConversation?.lead?.phone} // disable if no phone
                                onClick={handleStartCall}
                                className={`text-primary ${!selectedConversation?.lead?.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Phone size={20} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex flex-col flex-grow relative scroll-smooth overflow-y-auto ">
                {/* <LoadingOverlay visible={isLoading || isLoadingPlatform} overlayBlur={2} /> */}
                {isLoading || isLoadingPlatform || isLoadingCreateChannel ? (
                    <ChatSkeleton />
                ) : (
                    <div ref={conversationRef} className="flex-1 scroll-smooth overflow-y-auto p-4 space-y-4 md:p-6">
                        {messages.reduce((acc: JSX.Element[], message, index) => {
                            const messageDate = new Date(message.created_at).toLocaleDateString();
                            const prevMessageDate = index > 0 ? new Date(messages[index - 1].created_at).toLocaleDateString() : null;

                            if (messageDate !== prevMessageDate) {
                                acc.push(
                                    <div key={`date-${messageDate}`} className="text-center text-xs text-gray-500 my-2">
                                        {new Date(message.created_at).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true,
                                        })}
                                    </div>
                                );
                            }

                            acc.push(
                                <RenderMessage
                                    message={message}
                                    key={message.id}
                                    selectedPlatform={platformOptions.find((ch) => ch.id === message.channel_id)?.name || 'Select Platform'}
                                    handleUpdateMessage={(status) => {
                                        setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status } : msg)));
                                    }}
                                    handleResendMessage={handleResendMessage} // 👈 added
                                />
                            );

                            return acc;
                        }, [])}
                    </div>
                )}
                <div className="flex flex-col gap-2 my-3">
                    {selectedChannelName === 'Email' && selectedPlatform !== undefined && emailChannel?.id !== undefined && emailChannel?.id === selectedPlatform && cannotContinueConversation && (
                        <div className="flex items-center justify-center bg-white mx-4">
                            <p className="text-black bg-red-400 p-3 rounded-lg">To continue this conversation, please connect this email: {platformUserContact} </p>
                        </div>
                    )}
                    {selectedChannelName === 'Email' && selectedPlatform !== undefined && emailChannel?.id !== undefined && emailChannel?.id === selectedPlatform && !leadMatched && (
                        <div className="flex items-center justify-center bg-white mx-4">
                            <p className="text-black bg-red-400 p-3 rounded-lg">Lead has changed email: {leadEmail} </p>
                        </div>
                    )}
                    {selectedChannelName === 'SMS' && selectedConversation?.blocked === 1 && (
                        <div className="flex items-center justify-center bg-white mx-4">
                            <p className="text-black bg-red-400 p-3 rounded-lg">You have been blocked </p>
                        </div>
                    )}
                    {selectedChannelName === 'SMS' && auth?.user?.company?.messaging_service === null && (
                        <div className="flex items-center justify-center bg-white mx-4">
                            <p className="text-black bg-red-400 p-3 rounded-lg">For SMS, you need to connect A2P 10DLC Messaging Service </p>
                        </div>
                    )}
                </div>
                {/* Reply box */}
                <div className="border-t border-gray-200 px-4 py-3 relative md:px-6 md:py-4">
                    <form
                        className="relative flex border-gray-200 rounded-md border"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!selectedPlatform || !replyText.trim()) return;
                            const channelName = platformOptions.find((ch) => ch.id === selectedPlatform)?.name;
                            if (channelName === 'EMAIL' && !emailSubject.trim()) {
                                showNotification({ title: 'Error', message: 'Subject is mandatory for emails', color: 'red' });
                                return;
                            }
                            sendMessage(selectedConversationId, replyText, selectedPlatform);
                            setReplyText('');
                            if (textareaRef.current) textareaRef.current.style.height = 'auto';
                        }}
                    >
                        <div className="flex flex-col w-full">
                            {selectedChannelName === 'EMAIL' && (
                                <div className="flex flex-col border-b border-gray-200 px-4 py-3 bg-gray-50/50 rounded-t-md transition-all">
                                    {!isEditingSubject ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Subject:</span>
                                                <span className="text-sm font-medium text-gray-800 truncate">{emailSubject || 'No Subject'}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingSubject(true);
                                                    setEmailSubject('');
                                                }}
                                                className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors whitespace-nowrap ml-2 font-medium"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                New Subject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Subject:</span>
                                                <input
                                                    type="text"
                                                    value={emailSubject}
                                                    onChange={(e) => setEmailSubject(e.target.value)}
                                                    placeholder="Enter new subject..."
                                                    className="w-full text-sm font-medium text-gray-800 bg-white border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 transition-shadow disabled:opacity-50"
                                                    disabled={isLoading || isLoadingPlatform || !selectedPlatform}
                                                    autoFocus
                                                />
                                                {originalSubject && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditingSubject(false);
                                                            setEmailSubject(originalSubject);
                                                        }}
                                                        className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors whitespace-nowrap ml-2 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                                Starting a new subject will create a new email thread.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Textarea with send icon positioned inside */}
                            <div className="relative w-full flex items-stretch">
                                <textarea
                                    ref={textareaRef}
                                    value={replyText}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (replyText.trim() && selectedPlatform) {
                                                const channelName = platformOptions.find((ch) => ch.id === selectedPlatform)?.name;
                                                if (channelName === 'EMAIL' && !emailSubject.trim()) {
                                                    showNotification({ title: 'Error', message: 'Subject is mandatory for emails', color: 'red' });
                                                    return;
                                                }
                                                sendMessage(selectedConversationId, replyText, selectedPlatform);
                                                setReplyText('');
                                                if (textareaRef.current) textareaRef.current.style.height = 'auto';
                                            }
                                        }
                                    }}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (selectedChannelName === 'SMS' && val.length > 1600) {
                                            val = val.substring(0, 1600);
                                        }
                                        setReplyText(val);

                                        if (textareaRef.current) {
                                            textareaRef.current.style.height = 'auto';
                                            const maxHeight = 160;
                                            const scrollHeight = textareaRef.current.scrollHeight;

                                            if (scrollHeight > maxHeight) {
                                                textareaRef.current.style.height = `${maxHeight}px`;
                                                textareaRef.current.style.overflowY = 'auto';
                                            } else {
                                                textareaRef.current.style.height = `${scrollHeight}px`;
                                                textareaRef.current.style.overflowY = 'hidden';
                                            }
                                        }
                                    }}
                                    rows={3}
                                    maxLength={selectedChannelName === 'SMS' ? 1600 : undefined}
                                    className={`w-full max-h-[160px] min-h-[80px] resize-none overflow-y-auto py-3 pl-4 pr-[50px] text-sm focus:outline-none focus:ring-inset focus:ring-2 disabled:opacity-50 leading-relaxed transition-colors ${selectedChannelName === 'SMS' && !smsEncodingInfo.isGSM ? 'focus:ring-yellow-500 bg-yellow-50/10' : 'focus:ring-purple-500'} ${selectedChannelName === 'SMS' && smsEncodingInfo.isAtLimit ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    placeholder="Type your message..."
                                    disabled={isLoading || isLoadingPlatform || !selectedPlatform || (selectedChannelName === 'SMS' && selectedConversation?.blocked === 1)}
                                />

                                {/* Send icon button (bottom-right inside textarea) */}
                                {selectedPlatform && replyText && (
                                    <button
                                        type="submit"
                                        className="absolute bottom-[12px] right-[16px] p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
                                        disabled={!replyText.trim() || isLoading || (selectedChannelName === 'SMS' && smsEncodingInfo.isAtLimit && replyText.length > 1600)}
                                    >
                                        <Send size={16} />
                                    </button>
                                )}
                            </div>
                            {selectedChannelName === 'SMS' && (
                                <div className="flex items-center justify-end px-4 py-2 text-xs border-t border-gray-100 bg-gray-50 text-gray-500 rounded-b-md transition-colors">
                                    <div className={`font-medium whitespace-nowrap ${smsEncodingInfo.isAtLimit ? 'text-red-500' : ''}`}>
                                        {smsEncodingInfo.length}/1600
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Platform selector */}
                        <div className="flex items-center justify-between">
                            <button
                                disabled={isLoadingPlatform}
                                type="button"
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-transparent border-none disabled:opacity-50"
                                onClick={() => setShowPlatformMenu(!showPlatformMenu)}
                            >
                                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                {platformOptions.find((channel) => channel.id === selectedPlatform)?.name || 'Select Platform'}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Platform menu */}
                        {showPlatformMenu && selectedConversationId && (
                            <PlatformSelector
                                onSelect={handlePlatformSelect}
                                selectedPlatform={selectedPlatform}
                                selectedConversationId={selectedConversationId}
                                onClose={() => setShowPlatformMenu(false)}
                            />
                        )}
                    </form>
                </div>
                {/* Floating action button for mobile */}
                {isMobile && (
                    <div className="fixed bottom-6 right-6 z-10">
                        <div className="relative">
                            <button className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-600 text-white shadow-lg" onClick={() => setShowPlatformMenu(!showPlatformMenu)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
// function getMessagesByConversation(selectedConversationId: number | null): IMessage[] {
//     if (!selectedConversationId) return [];
//     const conversation = conversations.find((c) => c.id === selectedConversationId);
//     return conversation ? conversation.messages : [];
// }
