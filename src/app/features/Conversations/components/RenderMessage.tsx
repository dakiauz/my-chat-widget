import React, { useEffect } from 'react';
import { IMessage, IMessageStatus } from '../models/conversation';
import IconClock from '../../../../_theme/components/Icon/IconClock';
import IconChecks from '../../../../_theme/components/Icon/IconChecks';
import { useGetMessageStatusMutation } from '../services/conversationsApiSlice';
import { CircleAlert } from 'lucide-react';

interface RenderMessageProps {
    message: IMessage;
    selectedPlatform: string;
    handleUpdateMessage: (status: IMessageStatus) => void;
    handleResendMessage: (message: IMessage) => void; // NEW
}

function RenderMessage({ message, selectedPlatform, handleUpdateMessage, handleResendMessage }: RenderMessageProps) {
    const [getMessageStatus] = useGetMessageStatusMutation();
    useEffect(() => {
        if (message.id < 0) return;
        if (message.status === 'PENDING' && message.direction === 'OUTBOUND') {
            const interval = setInterval(() => {
                getMessageStatus(message.id)
                    .unwrap()
                    .then((response) => {
                        handleUpdateMessage(response.data.status);
                        if (response.data.status !== 'PENDING') {
                            clearInterval(interval);
                        }
                    });
            }, 4000);
            return () => clearInterval(interval);
        } else return;
    }, [message]);
    return (
        <div key={message.id} className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
            <div className={`w-full max-w-[80%] rounded-lg p-3 ${message.direction === 'OUTBOUND' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                {message.subject && selectedPlatform?.toLowerCase() === 'email' && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">Subject: {message.subject}</p>
                )}
                <p className="text-sm break-all">{message.body}</p>
                <div className="flex items-center justify-between gap-1 mt-1">
                    <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Messaged on</span>
                        <span className={`text-xs flex items-center capitalize ${selectedPlatform?.toLowerCase() === 'sms' ? 'text-gray-500' : 'text-blue-500'}`}>
                            <span className={`h-2 w-2 rounded-full mr-1 uppercase ${selectedPlatform?.toLowerCase() === 'sms' ? 'bg-gray-500' : 'bg-blue-500'}`}></span>
                            {selectedPlatform?.toLowerCase()}
                        </span>
                        {message.status === 'SENT' && message.direction === 'OUTBOUND' && <IconChecks className="text-primary" />}
                        {message.status === 'PENDING' && <IconClock className="text-gray-500" />}
                        {/* {message.status === 'DELIVERED' && <IconChecks className="text-green-500" />}
                        {message.status === 'READ' && <IconChecks className="text-blue-500" />} */}
                        {message.status === 'FAILED' && <CircleAlert onClick={() => handleResendMessage(message)} className="text-red-500 w-4 h-4 cursor-pointer hover:text-red-700" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RenderMessage;
