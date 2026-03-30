import React, { useRef, useEffect, useState } from "react";
import Echo from "laravel-echo";

// Assuming MessageListener and AgentMessageListener are components that
// subscribe to real-time events and update the main state via setMessages.
import AgentMessageListener from "./AgentMessageListener";
import IconRefresh from "../../../_theme/components/Icon/IconRefresh"; // Assuming this path exists

type Message = {
    event?: string;
    channel?: string;
    data?: {
        id: number;
        conversation_id: number;
        message: string;
        sender_type: "client" | "agent";
    };
    status?: "unassigned" | "assigned";
};

interface AgentConversationViewProps {
    echoInstance: Echo<"reverb"> | null;
    selectedConversationId: number;
    activeConversationMessages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    companyId: number | null;
}

// NOTE: Since the first example has a `getInitials` utility, I've used
// a simple placeholder for the user's initials/icon for this refactoring.

export default function AgentConversationView({
    echoInstance,
    selectedConversationId,
    activeConversationMessages,
    setMessages,
    companyId,
}: AgentConversationViewProps) {
    const [agentMessage, setAgentMessage] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom of message list
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeConversationMessages]);

    // Handle agent message send
    const handleAgentMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = agentMessage.trim();

        if (!trimmedMessage || !selectedConversationId) {
            console.log("⚠️ Message is empty or no conversation is assigned.");
            return;
        }

        // Optimistically add message to UI
        const tempId = -Date.now();
        const optimisticMessage: Message = {
            data: {
                id: tempId, // Temporary ID
                conversation_id: selectedConversationId,
                message: trimmedMessage,
                sender_type: "agent",
            },
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const authToken = localStorage.getItem("authToken");
            const apiBase = (import.meta.env.VITE_BACKEND_API_ADDRESS || '').replace(/\/$/, '');

            // You might want to show a loading state here
            const res = await fetch(`${apiBase}/chat-widget/send/agent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    message: trimmedMessage,
                    conversation_id: selectedConversationId,
                }),
            });

            if (!res.ok) {
                // Handle failure: maybe revert the optimistic message's status/remove it
                throw new Error("Failed to send message from agent");
            }

            // In a real app, the server would broadcast the *final* message,
            // and the AgentMessageListener would update the state with the real ID.
            // For now, we rely on the listener to handle the final state.

            setAgentMessage("");
        } catch (error) {
            console.error("❌ Error sending agent message:", error);
            // Optionally remove the optimistic message on failure
            setMessages((prev) => prev.filter((msg) => msg.data?.id !== tempId));
        }
    };

    // Dummy refetch function as per the first example, though the real-time nature
    // might make this primarily for debugging/manual refresh.
    const refetchMessages = () => {
        console.log("Refreshing messages...");
        // In a real app, you would dispatch an action or call a hook
        // to fetch all messages for the selectedConversationId from a REST API.
        // For this real-time example, we'll just log.
    };
    // Dummy loading state since you didn't have one for the view itself
    const isLoading = false;

    return (
        <div className="flex flex-grow max-h-full w-full flex-col bg-white">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
                <div className="flex justify-between items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                            {/* Placeholder for Initials */}
                            <span className="text-sm font-medium">C{selectedConversationId}</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium">Conversation with Client (ID: {selectedConversationId})</h2>
                            {/* <p className="text-xs text-gray-400">Online</p> */}
                        </div>
                    </div>
                    <button onClick={refetchMessages} className={`transition-transform ${isLoading ? 'animate-spin' : ''}`} disabled={isLoading}>
                        <IconRefresh />
                    </button>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex flex-col flex-grow relative scroll-smooth overflow-y-auto">
                <AgentMessageListener
                    echoInstance={echoInstance}
                    companyId={companyId}
                    conversationId={selectedConversationId}
                    setMessages={setMessages}
                />
                <div ref={messagesEndRef} className="flex-1 scroll-smooth overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {activeConversationMessages.map((msg, index) => (
                        <div
                            key={msg.data?.id ?? index}
                            className={`flex ${msg.data?.sender_type === "agent"
                                ? "justify-end"
                                : "justify-start"
                                }`}
                        >
                            <div
                                className={`p-3 rounded-xl max-w-[70%] text-white shadow-sm ${msg.data?.sender_type === "agent"
                                    ? "bg-blue-500 rounded-br-sm"
                                    : "bg-gray-500 rounded-bl-sm"
                                    }`}
                            >
                                <p>{msg.data?.message}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Reply box */}
            <div className="p-4 bg-white border-t border-gray-300">
                <form onSubmit={handleAgentMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={agentMessage}
                        onChange={(e) => setAgentMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!agentMessage.trim()}
                        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}