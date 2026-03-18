import { useState, useMemo } from 'react';
import InboxDropdown from './InboxDropdown';
import { getInitials } from '../../../shared/utils/utils';
import { IConversation } from '../models/conversation';
import { motion, AnimatePresence } from 'framer-motion';
import IconChatDot from '../../../../_theme/components/Icon/IconChatDot';
import IconMail from '../../../../_theme/components/Icon/IconMail';
import ConversationNewChat from './ConversationNewChat';
import ConversationNewEmail from './ConversationNewEmail';
import { useDisclosure } from '@mantine/hooks';
import { useSendQuickMessageMutation } from '../services/conversationsApiSlice';
import { showNotification } from '@mantine/notifications';

interface ConversationsListProps {
    conversations: IConversation[];
    selectedConversationId: number | null;
    onSelectConversation: (id: number) => void;
}

export type InboxType = 'All Inboxes' | 'Email' | 'Sms';

export default function ConversationsList({ selectedConversationId: selectedConversation, onSelectConversation, conversations }: ConversationsListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInbox, setSelectedInbox] = useState<InboxType>('All Inboxes');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Filter conversations based on search query and selected inbox
    const filteredConversations = useMemo(() => {
        return conversations
            .filter((conversation) => {
                const matchesSearch =
                    searchQuery === '' || conversation.name?.toLowerCase().includes(searchQuery.toLowerCase()) || conversation.latest_message?.body.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesInbox = selectedInbox === 'All Inboxes' || conversation.channels.find((channel) => channel.name.toLowerCase() === selectedInbox.toLowerCase());
                return matchesSearch && matchesInbox;
            })
            .sort((a, b) => {
                const dateA = new Date(a.latest_message?.created_at ?? a.created_at).getTime();
                const dateB = new Date(b.latest_message?.created_at ?? b.created_at).getTime();
                return dateB - dateA;
            });
    }, [searchQuery, selectedInbox, conversations]);

    const handleInboxSelect = (inbox: InboxType) => {
        setSelectedInbox(inbox);
        setDropdownOpen(false);
    };

    const [chatOpened, { open: openChat, close: closeChat }] = useDisclosure();
    const [emailOpened, { open: openEmail, close: closeEmail }] = useDisclosure();
    const [sendQuickMessage, { isLoading: isSending }] = useSendQuickMessageMutation();

    const handleStartChat = async (data: { phoneNumber: string; email: string; subject?: string; message: string; channel: 'SMS' | 'EMAIL' }) => {
        try {
            await sendQuickMessage({
                channel: data.channel,
                recipient: data.channel === 'EMAIL' ? data.email : data.phoneNumber,
                phoneNumber: data.phoneNumber,
                email: data.email,
                subject: data.subject || 'New Conversation',
                body: data.message
            }).unwrap();

            showNotification({
                title: 'Success',
                message: 'Message sent successfully',
                color: 'green'
            });
            closeChat();
            closeEmail();
        } catch (error) {
            console.error('Failed to send message:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to send message',
                color: 'red'
            });
        }
    };

    return (
        <div className="flex max-h-[calc(100vh-140px)] h-[calc(100vh-140px)] w-full flex-col">
            {/* Message header */}
            <div className="flex items-center justify-between py-3">
                <div className="text-xl font-bold">Message</div>
                <div className="relative border border-gray-200 rounded-md p-2">
                    <button className="flex items-center text-ssm text-gray-600 font-semibold gap-4" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        {selectedInbox}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {dropdownOpen && <InboxDropdown selectedInbox={selectedInbox} onSelect={handleInboxSelect} onClose={() => setDropdownOpen(false)} />}
                </div>
            </div>

            {/* Search */}
            <div className="p-2 ">
                <div className="relative">
                    <svg
                        className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search Message"
                        className="py-2  w-full rounded-md border border-gray-200 bg-gray-50 pl-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="absolute right-7 top-[52%] -translate-y-1/2 transform text-gray-400 hover:text-gray-600" onClick={() => setSearchQuery('')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ConversationNewChat
                opened={chatOpened}
                onClose={closeChat}
                onStartChat={handleStartChat}
                open={openChat}
                loading={isSending}
            />
            <ConversationNewEmail
                opened={emailOpened}
                onClose={closeEmail}
                onStartEmail={handleStartChat}
                loading={isSending}
            />

            {/* Action Buttons */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="space-y-2 pb-2">
                    {[
                        {
                            icon: IconChatDot,
                            label: 'New Chat',
                            color: 'bg-green-800/80',
                            onClick: (e: React.MouseEvent) => {
                                e.preventDefault();
                                openChat();
                            },
                        },
                        {
                            icon: IconMail,
                            label: 'New Email',
                            color: 'bg-blue-700/80',
                            onClick: (e: React.MouseEvent) => {
                                e.preventDefault();
                                openEmail();
                            },
                        },
                    ].map((item, index) => (
                        <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <div onClick={item.onClick} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-grey-50  cursor-pointer">
                                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                                    <item.icon fill={true} duotone={false} className="text-white" />
                                </div>
                                <span className="text-sm font-semibold font-urbanist text-gray-900">{item.label}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Conversation list */}
            <div className="px-2 flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-500">No conversations found</p>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`flex cursor-pointer items-start gap-3 p-2  hover:bg-gray-50 rounded-md ${selectedConversation === conversation.id ? 'bg-gray-100' : ''}`}
                            onClick={() => onSelectConversation(conversation.id)}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200/70 text-gray-700">
                                <span className="text-sm font-bold">
                                    {(conversation.name?.trim().startsWith('+')) ?
                                        // If name is a phone number: Check direction to decide NC vs UK
                                        (conversation.latest_message?.direction === 'INBOUND' ? 'UK' : 'NC')
                                        : getInitials(conversation?.name ?? '')
                                    }
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-sm truncate ${!conversation.read ? 'font-bold' : 'font-medium'}`}>
                                        <span className="font-urbanist">{conversation.name} </span>
                                    </span>
                                    <span className="text-xs text-nowrap font-urbanist">
                                        {new Date(conversation?.latest_message?.created_at ?? conversation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <p className={`text-sm text-gray-500 truncate ${!conversation.read ? 'font-medium' : ''}`}>{conversation.latest_message?.body}</p>
                                    {conversation?.unread_messages_count > 0 && (
                                        <span className="ml-2 inline-block h-4 w-4 text-xs text-center text-white rounded-full bg-purple-600">{conversation.unread_messages_count}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
