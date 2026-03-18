import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, User, RefreshCw, Code, Clipboard, X, Bot } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import Echo, { Broadcaster } from 'laravel-echo';
import Pusher from 'pusher-js';
import { IRootState } from '../../store';
import CreateNewCall from '../Calls/components/CreateNewCall';
import { IConversation, IMessage } from '../Calls/types';
import { useReadChatWidgetConversationMutation } from '../Conversations/services/conversationsApiSlice';

import backendApiAddress from '../../shared/config/address';

const API_BASE_URL = backendApiAddress;
const REVERB_CONFIG = {
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || '1p7oeyo29jgbxsdwu2hd',
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
};

// Global Pusher setup
// @ts-ignore
window.Pusher = Pusher;
let echoInstance: Echo<keyof Broadcaster> | null = null;

const getEcho = (authToken: string | null = null) => {
    if (echoInstance) {
        if (authToken || !REVERB_CONFIG.authEndpoint) {
            // @ts-ignore
            echoInstance.disconnect();
            echoInstance = null;
        } else {
            return echoInstance;
        }
    }

    const config: any = { ...REVERB_CONFIG };

    if (authToken) {
        config.auth = {
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json',
            },
        };
    }

    // @ts-ignore
    echoInstance = new Echo(config);
    return echoInstance;
};

// =============================
// Agent Dashboard Component
// =============================
const AgentDashboard = () => {
    const dispatch = useDispatch();
    const { token: reduxToken, user } = useSelector((state: IRootState) => state.auth);
    const [readChatWidgetConversation] = useReadChatWidgetConversationMutation();
    const agentName = user?.name ?? '-';
    const agentId = user?.id ?? null;
    const companyId = user?.company?.id ?? null;

    const localStorageToken = localStorage.getItem('authToken');
    const authToken = reduxToken ?? localStorageToken ?? '';
    const isLoggedIn = !!authToken && !!agentId && !!companyId;

    const [unassignedConversations, setUnassignedConversations] = useState<IConversation[]>([]);
    const [assignedConversations, setAssignedConversations] = useState<IConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const echoRef = useRef<Echo<'reverb'> | null>(null);
    const authTokenRef = useRef(authToken);

    // 👇 Widget Modal States
    const [showWidgetModal, setShowWidgetModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const code = `<script
  src="https://cdn.jsdelivr.net/gh/dakiauz/my-chat-widget/widget.iife.js"
  data-client-id="${companyId}"
  data-primary-color="#343434"
  data-secondary-color="#00ff00"
  data-api-base-url="${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}"
></script>`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    // Keep token ref in sync
    useEffect(() => {
        authTokenRef.current = authToken;
    }, [authToken]);

    // Re-initialize Echo on login/logout state change
    useEffect(() => {
        if (isLoggedIn && authToken) {
            // @ts-ignore
            echoRef.current = getEcho(authToken);
            loadConversations();
        } else if (!isLoggedIn && echoRef.current) {
            // @ts-ignore
            echoRef.current.disconnect();
            echoRef.current = null;
        }
    }, [isLoggedIn, authToken]);

    // Company-wide unassigned conversations
    useEffect(() => {
        if (isLoggedIn && echoRef.current && companyId) {
            // @ts-ignore
            const channel = echoRef.current.private(`company.${companyId}.conversations`);

            channel.listen('.Chat.Widget.Conversation', (data: any) => {
                setUnassignedConversations((prev) => {
                    const exists = prev.find((c) => c.id === data.conversation_id);
                    const newConv: IConversation = {
                        id: data.conversation_id,
                        client_email: data.client_email,
                        client_phone_number: data.client_phone_number || 'Unknown Phone',
                        lastMessage: data.message,
                        is_ai_active: data.is_ai_active !== undefined ? data.is_ai_active : true,
                        unread: true,
                        user_id: null,
                    };

                    if (exists) {
                        return prev.map((c) => (c.id === data.conversation_id ? { ...c, lastMessage: data.message, unread: true } : c));
                    } else {
                        return [newConv, ...prev];
                    }
                });
            });

            return () => {
                channel.stopListening('.Chat.Widget.Conversation');
                echoRef.current?.leave(`company.${companyId}.conversations`);
            };
        }
    }, [isLoggedIn, companyId]);

    // Assigned conversation listener
    useEffect(() => {
        if (isLoggedIn && echoRef.current && selectedConversation && selectedConversation.user_id) {
            const channelName = `company.${companyId}.conversation.${selectedConversation.id} `;

            // @ts-ignore
            const channel = echoRef.current.private(channelName);

            const handler = (data: any) => {
                setMessages((prev) => {
                    const exists = prev.some(
                        (msg) => msg.id === data.id || (msg.message === data.message && msg.sender_type === data.sender_type && msg.chat_widget_conversation_id === data.conversation_id)
                    );

                    if (exists) return prev;

                    const tempIndex = prev.findIndex(
                        (msg) =>
                            typeof msg.id === 'string' &&
                            msg.id.startsWith('temp-') &&
                            msg.message === data.message &&
                            msg.sender_type === data.sender_type &&
                            msg.conversation_id === data.conversation_id
                    );

                    if (tempIndex !== -1) {
                        const updated = [...prev];
                        updated[tempIndex] = {
                            id: data.id,
                            message: data.message,
                            sender_type: data.sender_type,
                            timestamp: new Date().toISOString(),
                            chat_widget_conversation_id: data.conversation_id,
                        };
                        return updated;
                    }

                    return [
                        ...prev,
                        {
                            id: data.id,
                            message: data.message,
                            sender_type: data.sender_type,
                            timestamp: new Date().toISOString(),
                            conversation_id: data.conversation_id,
                        },
                    ];
                });
            };

            channel.listen('.Chat.Widget.Conversation', handler);

            return () => {
                channel.stopListening('.Chat.Widget.Conversation');
                echoRef.current?.leave(channelName);
            };
        }
    }, [isLoggedIn, selectedConversation, companyId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load conversations
    const loadConversations = async () => {
        if (!authTokenRef.current || !agentId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/chat-widget/list`, {
                headers: {
                    Authorization: `Bearer ${authTokenRef.current} `,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to load conversations');
            const result = await response.json();
            const sortedData = [...result.data].sort((a: IConversation, b: IConversation) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime());

            if (result.success) {
                const assigned = sortedData.filter((c: IConversation) => c.user_id === agentId).map((c: IConversation) => ({ ...c, assigned: true }));

                const unassigned = sortedData.filter((c: IConversation) => c.user_id === null).map((c: IConversation) => ({ ...c, assigned: false }));

                setAssignedConversations(assigned);
                setUnassignedConversations(unassigned);

                setSelectedConversation((prev) => {
                    if (!prev) return null;
                    const updated = assigned.find((c: { id: number }) => c.id === prev.id) || unassigned.find((c: { id: number }) => c.id === prev.id);
                    return updated || prev;
                });
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const selectConversation = (conversation: IConversation) => {
        setSelectedConversation(conversation);
        setMessages(conversation.messages || []);
        readChatWidgetConversation(conversation.id).then(() => {
            loadConversations();
        });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !authTokenRef.current || !agentId) return;

        const currentMessage = newMessage.trim();
        setMessages((prev) => [
            ...prev,
            {
                id: `temp - ${Date.now()} `,
                message: currentMessage,
                sender_type: 'agent',
                timestamp: new Date().toISOString(),
                conversation_id: selectedConversation.id,
            },
        ]);
        setNewMessage('');

        try {
            const isClaiming = !selectedConversation.user_id;
            const endpoint = `${API_BASE_URL}/chat-widget/send/agent`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authTokenRef.current} `,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    message: currentMessage,
                    conversation_id: selectedConversation.id,
                    sender_type: 'agent',
                }),
            });

            const result = await response.json();

            if (result.success) {
                loadConversations();
                if (isClaiming) {
                    const claimedConv = {
                        ...selectedConversation,
                        user_id: agentId,
                        assigned: true,
                        lastMessage: currentMessage,
                    };

                    setSelectedConversation(claimedConv);
                    setUnassignedConversations((prev) => prev.filter((c) => c.id !== claimedConv.id));
                    setAssignedConversations((prev) => [...prev, claimedConv]);
                } else {
                    setAssignedConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? { ...c, lastMessage: currentMessage } : c)));
                }
            } else {
                console.error('Failed to send message:', result.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const toggleBot = async () => {
        if (!selectedConversation || !authTokenRef.current) return;

        try {
            const response = await fetch(`${API_BASE_URL}/chat-widget/conversation/${selectedConversation.id}/toggle`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authTokenRef.current}`,
                    Accept: 'application/json',
                },
            });

            const result = await response.json();

            if (result.success && result.data) {
                // Update local state with new conversation data
                setSelectedConversation(prev => prev ? {
                    ...prev,
                    is_ai_active: result.data.is_ai_active,
                    user_id: result.data.user_id, // Update in case it was auto-assigned
                    assigned: !!result.data.user_id
                } : null);

                // Refresh list to update sidebar status if needed
                loadConversations();
            }
        } catch (error) {
            console.error('Error toggling bot:', error);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Login Required 🔒</h2>
                    <p className="mb-6 text-gray-700">Please sign in via the login page to access the Agent Dashboard.</p>
                    <a href="/sign-in" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors inline-block">
                        Go to Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4">
                <div className=" flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-4">
                            <span className="w-[16px] rounded-[4px]  h-[30px] bg-primary"></span>
                            <h1 className="text-xl font-semibold">Agent Dashboard</h1>
                        </div>
                        {agentName && <p className="text-xsm text-gray-500 ml-[33px]">{agentName}</p>}
                    </div>

                    <div className="flex space-x-2">
                        <button onClick={loadConversations} className="bg-primary text-white hover:bg-primary px-3 py-2 rounded transition-colors flex items-center">
                            <RefreshCw size={16} className="mr-1" /> Refresh
                        </button>
                        {/* ✅ Export Widget Button */}
                        <button onClick={() => setShowWidgetModal(true)} className="bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded transition-colors flex items-center">
                            <Code size={16} className="mr-1" /> Export Widget
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-lg overflow-hidden mt-3">
                    <div className="flex h-[calc(100vh-120px)]">
                        {/* Sidebar */}
                        <div className="w-80 border-r overflow-y-auto">
                            {/* Unassigned Chats */}
                            <div className="p-4 bg-yellow-50 border-b">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Users size={20} className="text-yellow-600" />
                                    <h3 className="font-semibold text-gray-800">Unassigned Chats</h3>
                                    {unassignedConversations.length > 0 && <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">{unassignedConversations.length}</span>}
                                </div>
                                {unassignedConversations.length === 0 ? (
                                    <p className="text-sm text-gray-500">No unassigned chats</p>
                                ) : (
                                    unassignedConversations.map((conv) => {
                                        const lastMsg = conv?.messages?.length ? conv.messages[conv.messages.length - 1].message : null;
                                        return (
                                            <div
                                                key={conv.id}
                                                onClick={() => selectConversation({ ...conv, assigned: false })}
                                                className={`p-3 mb-2 rounded cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-yellow-200' : 'bg-white hover:bg-yellow-100'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-sm max-w-[200px] truncate">{conv.client_phone_number}</p>
                                                        {lastMsg && <p className="text-xs text-gray-600 truncate w-[210px]">{lastMsg}</p>}
                                                    </div>
                                                    {Number(conv?.unread_count) > 0 && (
                                                        <p className="inline-block h-4 w-4 text-xs text-center text-white rounded-full bg-purple-600">{conv.unread_count}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Assigned Chats */}
                            <div className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <User size={30} className="text-blue-600" />
                                    <h3 className="font-semibold text-lg text-gray-800">My Chats</h3>
                                </div>
                                {assignedConversations.length === 0 ? (
                                    <p className="text-sm text-gray-500">No assigned chats</p>
                                ) : (
                                    assignedConversations.map((conv) => {
                                        const lastMsg = conv?.messages?.length ? conv.messages[conv.messages.length - 1].message : null;
                                        {
                                            console.log('Rendering conversation:', conv);
                                        }
                                        return (
                                            <div
                                                key={conv.id}
                                                onClick={() => selectConversation({ ...conv, assigned: true })}
                                                className={`flex justify-between items-center p-3 mb-2 gap-1 rounded cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div>
                                                    <p className="font-medium text-[14px] max-w-[250px] truncate">{conv.client_phone_number}</p>
                                                    {lastMsg && <p className="text-xs text-gray-600 truncate w-[200px]">{lastMsg}</p>}
                                                </div>
                                                {Number(conv?.unread_count) > 0 && (
                                                    <p className="inline-block h-4 w-4 text-xs text-center text-white rounded-full bg-purple-600">{conv.unread_count}</p>
                                                )}

                                                <CreateNewCall variant="callLogItem" conversation={conv} />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedConversation ? (
                                <>
                                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <h2 className="font-semibold">{selectedConversation.client_phone_number}</h2>
                                            <p className="text-sm text-gray-600">{selectedConversation.assigned ? 'Assigned to you' : 'Unassigned - Reply to claim'}</p>
                                        </div>
                                        {((user?.company as any)?.is_ai_ready) && (
                                            <button
                                                onClick={toggleBot}
                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${selectedConversation.is_ai_active
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {selectedConversation.is_ai_active ? (
                                                    <>
                                                        <User size={16} />
                                                        <span>Take Over (Human Control)</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bot size={16} />
                                                        <span>Enable AI Agent</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.sender_type === 'agent' ? 'bg-purple-100 text-black' : 'bg-gray-200 text-gray-800'}`}>
                                                    <p className="text-sm max-w-[350px] break-words">{msg.message}</p>
                                                    <p className="text-xs opacity-60 mt-1">{msg.sender_type === 'agent' ? 'You' : 'Client'}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-4 border-t bg-gray-50">
                                        <div className="flex space-x-2">
                                            <textarea
                                                ref={textareaRef}
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value);

                                                    if (textareaRef.current) {
                                                        textareaRef.current.style.height = 'auto';
                                                        const maxHeight = 120;
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
                                                rows={1}
                                                className="w-full max-h-20 min-h-10 resize-none overflow-hidden py-2 pl-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 rounded disabled:opacity-50 pr-[48px]" // add pr-9 for icon space
                                                placeholder={
                                                    ((user?.company as any)?.is_ai_ready) && selectedConversation.is_ai_active
                                                        ? 'Type to take over...'
                                                        : 'Type your message...'
                                                }
                                            />
                                            <button
                                                type="submit"
                                                onClick={sendMessage}
                                                className="absolute bottom-[58px] right-[50px] text-purple-600 hover:text-purple-800 disabled:opacity-50"
                                                disabled={!newMessage}
                                            >
                                                <Send />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                                        <p>Select a conversation to start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✅ Widget Export Modal */}
                    {showWidgetModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white w-96 rounded-lg shadow-lg p-6 relative">
                                <button onClick={() => setShowWidgetModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                                    <X size={20} />
                                </button>
                                <h2 className="text-lg font-semibold mb-3">Embed Chat Widget</h2>
                                <p className="text-sm text-gray-600 mb-3">
                                    Copy and paste this script into your website’s HTML before the closing
                                    <code> &lt;/body&gt; </code> tag.
                                </p>

                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto mb-3">
                                    {`<script
  src="https://cdn.jsdelivr.net/gh/dakiauz/my-chat-widget/widget.iife.js"
  data-client-id="${companyId}"
  data-primary-color="#343434"
  data-secondary-color="#00ff00"
  data-api-base-url="${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}"
></script>`}
                                </pre>

                                <button onClick={handleCopy} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center">
                                    <Clipboard size={16} className="mr-2" />
                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
