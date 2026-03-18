import React, { useEffect } from 'react';
import Echo from 'laravel-echo';

interface AgentMessageListenerProps {
    echoInstance: Echo<'reverb'> | null;
    companyId: number | null;
    conversationId: number | null;
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AgentMessageListener({ echoInstance, companyId, conversationId, setMessages }: AgentMessageListenerProps) {
    useEffect(() => {
        if (!echoInstance || !companyId || !conversationId) return;

        // const channelName = `company.${companyId}.conversation.${conversationId}`;
        const channelName = `company.${companyId}.conversation`;

        const channel = echoInstance.channel(channelName);

        // Example: listen for new messages in this conversation
        channel.listen('.Chat.Widget.Conversation', (data: any) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: data.id,
                    conversation_id: data.conversation_id,
                    message: data.message,
                    sender: data.sender_type,
                },
            ]);
        });

        // Example: listen for conversation status updates
        channel.listen('.Chat.Widget.Conversation', (data: any) => {
            setMessages((prev) => prev.map((msg) => (msg.conversation_id === data.conversation_id ? { ...msg, status: 'assigned' } : msg)));
        });

        return () => {
            echoInstance.leave(channelName);
        };
    }, [echoInstance, companyId, conversationId, setMessages]);

    return null; // side-effects only
}
