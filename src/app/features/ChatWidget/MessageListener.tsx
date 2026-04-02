import React, { useEffect } from 'react';
import Echo from "laravel-echo";

interface MessageListenerProps {
    echoInstance: Echo<"reverb"> | null;
    conversationId: number | null;
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function MessageListener({ echoInstance, conversationId, setMessages }: MessageListenerProps) {
    useEffect(() => {
        if (echoInstance && conversationId !== null) {
            const channelName = `chat.conversation.${conversationId}`;
            console.log(`Subscribing to channel: ${channelName}`);

            const channel = echoInstance.channel(channelName);

            // Listen for the .Chat.Widget.Conversation event (dot is required for broadcastAs)
            channel.listen(".Chat.Widget.Conversation", (data: any) => {
                console.log("🔥 MESSAGE RECEIVED! 🚀 :", data);
                // Update messages in the parent component's state
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { event: "Chat.Widget.Conversation", channel: channelName, data: data },
                ]);
            });

            // Cleanup function to leave the channel when the component unmounts or dependencies change
            return () => {
                console.log(`Leaving channel: ${channelName}`);
                echoInstance.leave(channelName);
            };
        }
    }, [echoInstance, conversationId, setMessages]); // Add setMessages to dependency array

    // This component doesn't render anything itself; it's purely for side effects.
    return null;
}