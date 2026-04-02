import React, { useState, useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import MessageListener from './MessageListener';
import { ChatBubbleLeftIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';
import { IRootState } from '@/app/store';

// Ensure Pusher is globally available for Echo
// @ts-ignore
window.Pusher = Pusher;

// Simple phone validation regex
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

interface ContactWidgetProps {
    primaryColor?: string;
    secondaryColor?: string;
    // 🛑 companyId no longer has a hardcoded default of 1 here.
    // It will receive the value from the Redux store via the parent component.
    companyId?: number | null;
    apiEndpoint?: string;
    chatApiEndpoint?: string;
    reverbHost?: string;
    reverbPort?: number;
    reverbAppKey?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error' | 'conversation';

type Message = {
    event: string;
    channel: string;
    data: {
        id: number;
        conversation_id: number;
        message: string;
        sender_type: 'client' | 'agent';
    };
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_API_ADDRESS || 'http://localhost:8000';

// Derive Reverb host and port from apiBaseUrl
let defaultReverbHost = 'localhost';
let defaultReverbPort = 8080;
try {
    const url = new URL(apiBaseUrl);
    defaultReverbHost = url.hostname;
    defaultReverbPort = url.protocol === 'https:' ? 443 : 8080;
} catch (e) {
    console.error("Invalid API URL for Reverb derivation", e);
}

const reverbAppKey = import.meta.env.VITE_REVERB_APP_KEY || '00yvcmmf59icia963gl5';
const reverbHost = import.meta.env.VITE_REVERB_HOST || defaultReverbHost;
const reverbPort = parseInt(import.meta.env.VITE_REVERB_PORT || String(defaultReverbPort));

const defaultApiBase = (apiBaseUrl || '').replace(/\/$/, '');

export default function ContactWidget({
    primaryColor = '#610BFC',
    secondaryColor = '#e5e7eb',
    companyId: companyIdProp = null,
    apiEndpoint = `${defaultApiBase}/chat-widget/create`,
    chatApiEndpoint = `${defaultApiBase}/chat-widget/send`,
    reverbHost: propReverbHost,
    reverbPort: propReverbPort,
    reverbAppKey: propReverbAppKey,
}: ContactWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formStatus, setFormStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [hasNudged, setHasNudged] = useState(false); // Latch to prevent multiple nudges
    // const reduxCompanyId = useSelector((state: IRootState) => state.auth.user?.company_id);
    const reduxCompanyId = null;
    const companyId = companyIdProp ?? reduxCompanyId;
    const [echoInstance, setEchoInstance] = useState<Echo<'reverb'> | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        client_phone_number: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        client_phone_number: '',
    });

    const [touched, setTouched] = useState({
        name: false,
        client_phone_number: false,
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setMounted(true);

        console.log("Widget ID initialized:", companyId);

        // Check for active session in sessionStorage
        if (companyId) {
            try {
                const savedSession = sessionStorage.getItem('dakia_widget_session');
                console.log("Checking session storage:", savedSession);

                if (savedSession) {
                    const session = JSON.parse(savedSession);
                    console.log("Parsed session:", session);

                    // Only restore if it matches the current company
                    if (session.company_id === companyId) {
                        console.log("Session matches company ID. Restoring...");
                        setFormData({
                            name: session.name,
                            client_phone_number: session.client_phone_number
                        });
                        // Auto-connect and restore history
                        startChatSession(session.name, session.client_phone_number, companyId);
                    } else {
                        console.log("Session company ID mismatch:", session.company_id, "!=", companyId);
                    }
                } else {
                    console.log("No saved session found.");
                }
            } catch (e) {
                console.error("Failed to parse/read widget session", e);
            }
        }
    }, [companyId]);

    const startChatSession = async (name: string, phone: string, cId: number) => {
        setFormStatus('submitting');
        setErrorMessage('');

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_id: cId,
                    client_name: name,
                    client_phone_number: phone,
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            const conversation = result.data;
            const convId = conversation.id;

            setConversationId(convId);
            setFormStatus('conversation');

            // Save session for page reloads
            const sessionData = {
                name,
                client_phone_number: phone,
                company_id: cId
            };
            console.log("Saving session data:", sessionData);
            sessionStorage.setItem('dakia_widget_session', JSON.stringify(sessionData));

            // Restore history or show welcome message
            if (conversation.messages && conversation.messages.length > 0) {
                // Map backend messages to frontend format
                const history = conversation.messages.map((msg: any) => ({
                    event: 'Chat.Widget.Conversation',
                    channel: `chat.conversation.${convId}`,
                    data: {
                        id: msg.id,
                        conversation_id: convId,
                        message: msg.message,
                        sender_type: msg.sender_type,
                    }
                }));
                setMessages(history);
            } else {
                setMessages([
                    {
                        event: 'Chat.Widget.Conversation',
                        channel: `chat.conversation.${convId}`,
                        data: { id: -1, conversation_id: convId, message: `Hello ${name}!`, sender_type: 'agent' },
                    },
                    {
                        event: 'Chat.Widget.Conversation',
                        channel: `chat.conversation.${convId}`,
                        data: { id: -2, conversation_id: convId, message: 'Thanks for reaching out! A live agent will be with you shortly.', sender_type: 'agent' },
                    },
                ]);
            }
        } catch (error) {
            console.error('Submission failed:', error);
            setFormStatus('error');
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    useEffect(() => {
        if (conversationId !== null && !echoInstance) {
            console.log('Attempting to connect to WebSocket...');

            const config = (window as any).__REVERB_CONFIG || {
                broadcaster: 'reverb',
                key: propReverbAppKey || reverbAppKey,
                wsHost: propReverbHost || reverbHost,
                wsPort: propReverbPort || reverbPort,
                wssPort: propReverbPort || reverbPort,
                forceTLS: (propReverbPort || reverbPort) === 443,
                enabledTransports: ['ws', 'wss'],
            };

            const echo = new Echo<'reverb'>(config);

            echo.connector.pusher.connection.bind('connected', () => {
                console.log('WebSocket connected successfully!');
            });

            echo.connector.pusher.connection.bind('disconnected', () => {
                console.log('WebSocket disconnected.');
            });

            setEchoInstance(echo);
        }
    }, [conversationId]);

    useEffect(() => {
        return () => {
            if (echoInstance) {
                echoInstance.disconnect();
                setEchoInstance(null);
            }
        };
    }, [echoInstance]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, formData[name as keyof typeof formData]);
    };

    const validateField = (name: string, value: string) => {
        let errorMessage = '';
        switch (name) {
            case 'client_phone_number':
                if (!PHONE_REGEX.test(value)) {
                    errorMessage = 'Please enter a valid phone number (e.g., +15550000000)';
                }
                break;
            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Name is required';
                }
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
        return !errorMessage;
    };

    const validateForm = () => {
        const nameValid = validateField('name', formData.name);
        const phoneValid = validateField('client_phone_number', formData.client_phone_number);
        setTouched({ name: true, client_phone_number: true });
        return nameValid && phoneValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateForm();
        if (!isValid || companyId === null || companyId === undefined) {
            setFormStatus('error');
            setErrorMessage('Please fix errors or check configuration.');
            return;
        }
        await startChatSession(formData.name, formData.client_phone_number, companyId);
    };

    // Inactivity Timer Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];

            // 1. RESET LATCH: If the user spoke, we allow nudging again.
            if (lastMessage.data.sender_type === 'client') {
                if (hasNudged) setHasNudged(false);
                return;
            }

            // 2. Start timer ONLY if:
            //    a) Last message is from AGENT
            //    b) We haven't nudged them since they last spoke (!hasNudged)
            if (lastMessage.data.sender_type === 'agent' && !hasNudged) {

                const msgText = lastMessage.data.message.toLowerCase();
                const isNudge = msgText === "are you there?" || msgText.includes("still there?");

                // CRITICAL: Ignore system status messages to prevent false triggers
                const isSystemMessage = msgText.includes("joined the chat") ||
                    msgText.includes("now chatting with");

                if (!isNudge && !isSystemMessage) {
                    console.log("⏳ Starting 10-second inactivity timer...");
                    timer = setTimeout(async () => {
                        console.log("⏰ Inactivity timer triggered. Sending nudge.");
                        await sendInactivityMessage();
                        setHasNudged(true); // LATCH LOCKED: No more nudges until user replies
                    }, 10000); // 10 seconds
                } else {
                    console.log("⏹️ Last message was ignored (nudge or system). Timer skipped.");
                }
            } else if (hasNudged) {
                console.log("⏹️ Inactivity timer skipped: User has already been nudged.");
            }
        }

        return () => clearTimeout(timer);
    }, [messages, hasNudged]);

    const sendInactivityMessage = async () => {
        if (!conversationId) return;
        try {
            // Updated to use the dedicated unauthenticated timer endpoint
            const response = await fetch(`${apiEndpoint.replace('/create', '/send-timer')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    message: "Are you there?",
                    // sender_type is handled by backend for this endpoint essentially
                }),
            });

            if (!response.ok) {
                console.error('Failed to send timer nudge:', response.status);
            } else {
                console.log('✅ Timer nudge sent successfully');
            }
        } catch (e) {
            console.error("Failed to send nudge", e);
        }
    };

    const handleUserMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage) {
            console.log('⚠️ Message is empty. Not sending.');
            return;
        }

        console.log('💬 Attempting to send user message to API:', trimmedMessage);

        setUserMessage('');

        try {
            const response = await fetch(chatApiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    message: trimmedMessage,
                }),
            });

            if (!response.ok) {
                console.error('API response for sending message was not OK.');
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log('✅ Message sent to API successfully.');
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            setMessages((prev) => [
                ...prev,
                {
                    event: 'Chat.Widget.Conversation',
                    channel: `chat.conversation.${conversationId}`,
                    data: {
                        id: Date.now(),
                        conversation_id: conversationId!,
                        message: 'Sorry, your message could not be sent. Please try again.',
                        sender_type: 'agent',
                    },
                },
            ]);
        }
    };

    const isFieldValid = (name: keyof typeof formData) => {
        return touched[name] && formData[name] && !errors[name];
    };

    const getDynamicColor = (color: string) => {
        return color.startsWith('#') ? { backgroundColor: color } : {};
    };

    const getClientBubbleColor = () => {
        return { backgroundColor: primaryColor, color: '#ffffff' };
    };

    const getAgentBubbleColor = () => {
        return { backgroundColor: secondaryColor, color: '#1f2937' };
    };

    if (!mounted) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[1000]">
            <MessageListener echoInstance={echoInstance} conversationId={conversationId} setMessages={setMessages} />
            {isOpen && (
                <div
                    className={`fixed bottom-20 right-5 z-50 w-80 h-[500px] flex flex-col overflow-hidden rounded-lg shadow-xl bg-white transition-transform transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                        }`}
                    style={{ transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-in' }}
                >
                    {/* Header */}
                    <div className="text-white p-4 flex flex-col gap-1 border-b border-gray-200" style={getDynamicColor(primaryColor)}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Live Chat</h3>
                            <button className="p-1 rounded-full hover:bg-gray-700 transition-colors" onClick={() => setIsOpen(false)} aria-label="Close chat widget">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-300">{formStatus === 'conversation' ? 'You are now chatting with an agent.' : 'Fill the email to start the chat.'}</p>
                    </div>

                    {/* Body */}
                    {formStatus === 'conversation' ? (
                        <div className="flex flex-col flex-grow bg-gray-50 h-[28rem]">
                            <div className="flex flex-col flex-1 p-4 gap-3 overflow-y-auto overscroll-contain">
                                {messages.filter(msg => msg.data && msg.data.message).map((msg, index) => {
                                    const isClient = msg.data.sender_type === 'client';
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isClient ? 'flex-end' : 'flex-start',
                                                width: '100%',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    maxWidth: '85%',
                                                    padding: '10px 14px',
                                                    borderRadius: '16px',
                                                    borderBottomRightRadius: isClient ? '2px' : '16px',
                                                    borderBottomLeftRadius: isClient ? '16px' : '2px',
                                                    fontSize: '14px',
                                                    lineHeight: '1.4',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    ...(isClient ? getClientBubbleColor() : getAgentBubbleColor())
                                                }}
                                            >
                                                <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.data.message}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleUserMessage} className="flex p-4 border-t border-gray-200 bg-white">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    className="flex-grow p-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="submit" className="ml-2 p-2 rounded-full text-white hover:bg-opacity-90 transition-colors" style={getDynamicColor(primaryColor)}>
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex flex-col flex-grow p-6">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={formStatus === 'submitting'}
                                            className={`w-full p-2.5 rounded-md border text-gray-800 bg-gray-50 focus:outline-none transition-colors ${errors.name && touched.name
                                                ? 'border-red-500 focus:ring-red-500'
                                                : isFieldValid('name')
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            {errors.name && touched.name ? (
                                                <InformationCircleIcon className="h-5 w-5 text-red-500" />
                                            ) : isFieldValid('name') ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {errors.name && touched.name && (
                                        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <InformationCircleIcon className="h-4 w-4" />
                                            <span>{errors.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="client_phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="client_phone_number"
                                            name="client_phone_number"
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.client_phone_number}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={formStatus === 'submitting'}
                                            className={`w-full p-2.5 rounded-md border text-gray-800 bg-gray-50 focus:outline-none transition-colors ${errors.client_phone_number && touched.client_phone_number
                                                ? 'border-red-500 focus:ring-red-500'
                                                : isFieldValid('client_phone_number')
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            {errors.client_phone_number && touched.client_phone_number ? (
                                                <InformationCircleIcon className="h-5 w-5 text-red-500" />
                                            ) : isFieldValid('client_phone_number') ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {errors.client_phone_number && touched.client_phone_number && (
                                        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <InformationCircleIcon className="h-4 w-4" />
                                            <span>{errors.client_phone_number}</span>
                                        </div>
                                    )}
                                </div>
                                {formStatus === 'error' && (
                                    <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm mb-4 flex items-center gap-2">
                                        <InformationCircleIcon className="h-5 w-5 text-red-600" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className={`w-full py-3 mt-4 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-colors ${formStatus === 'submitting' ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-opacity-90'
                                        }`}
                                    disabled={formStatus === 'submitting'}
                                    style={getDynamicColor(primaryColor)}
                                >
                                    {formStatus === 'submitting' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-b-transparent rounded-full animate-spin"></div>
                                            <span>Starting Chat...</span>
                                        </>
                                    ) : (
                                        'Start Chat'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                aria-label={isOpen ? 'Close chat widget' : 'Open chat widget'}
                style={getDynamicColor(primaryColor)}
            >
                {isOpen ? <XMarkIcon className="h-6 w-6" /> : <ChatBubbleLeftIcon className="h-6 w-6" />}
            </button>
        </div>
    );
}
