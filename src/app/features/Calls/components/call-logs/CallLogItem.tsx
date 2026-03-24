import { Button } from '../ui/button';
import { IconChevronDown, IconPhone, IconPhoneIncoming, IconPhoneX } from '@tabler/icons-react';
import type { CallLog } from '../../types';
import { formatTimeAgo, formatCallTime, formatCallDuration } from '../../utils/helpers';
import { useState } from 'react';
import TwilioAudioPlayer from './TwilioAudioPlayer';
import { useGetIntegrationsQuery } from '../../../Integrations/services/IntegrationApi';
import TranscriptModal from './TranscriptModal';
import CreateNewCall from '../CreateNewCall';
import { Trash2 } from 'lucide-react';
import { useDeleteCallLogMutation } from '../../../Integrations/services/TwillioApiSlice';
import { showNotification } from '@mantine/notifications';
import Swal from 'sweetalert2';

interface CallLogItemProps {
    callLog: CallLog;
    onCallBack: (phone: string, contactName: string) => void;
}

export const CallLogItem = ({ callLog, onCallBack }: CallLogItemProps) => {
    const getCallIcon = () => {
        switch (callLog.type) {
            case 'outgoing':
                return (
                    <span className="flex items-center gap-2 text-gray-400 font-urbanist text-sm">
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M10.2032 12.2124C9.94698 11.6843 9.61573 11.2999 9.04386 11.5343L7.91573 11.953C7.01261 12.3718 6.56261 11.953 6.10948 11.3218L4.07823 6.70304C3.82198 6.17492 3.95636 5.67804 4.52823 5.44367L6.10636 4.81242C6.67823 4.57492 6.58761 4.08117 6.33136 3.55304L4.97823 1.03429C4.72198 0.506166 4.19698 0.37804 3.62511 0.612415C2.48448 1.08429 1.53448 1.82492 0.921981 2.92179C0.171981 4.26242 0.546981 6.12804 0.696981 6.91242C0.846981 7.69679 1.37198 9.07179 2.05011 10.4812C2.72823 11.8937 3.32198 13.003 3.85323 13.6312C4.38448 14.2593 5.65948 15.978 7.23761 16.3624C8.53136 16.6749 9.92823 16.4124 11.072 15.9405C11.647 15.7062 11.647 15.2093 11.3907 14.678L10.2032 12.2124ZM16.4751 6.64992H10.9345L13.397 4.18742H11.5501L8.47198 7.26554L11.5501 10.3437H13.397L10.9345 7.88117H16.4751V6.64992Z"
                                fill="#767C7B"
                            />
                        </svg>
                        <span>Out-going</span>
                    </span>
                );
            case 'incoming':
                return (
                    <span className="flex items-center gap-2 text-blue-400 font-urbanist text-sm">
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M10.2032 12.2124C9.94698 11.6843 9.61573 11.2999 9.04386 11.5343L7.91573 11.953C7.01261 12.3718 6.56261 11.953 6.10948 11.3218L4.07823 6.70304C3.82198 6.17492 3.95636 5.67804 4.52823 5.44367L6.10636 4.81242C6.67823 4.57492 6.58761 4.08117 6.33136 3.55304L4.97823 1.03429C4.72198 0.506166 4.19698 0.37804 3.62511 0.612415C2.48448 1.08429 1.53448 1.82492 0.921981 2.92179C0.171981 4.26242 0.546981 6.12804 0.696981 6.91242C0.846981 7.69679 1.37198 9.07179 2.05011 10.4812C2.72823 11.8937 3.32198 13.003 3.85323 13.6312C4.38448 14.2593 5.65948 15.978 7.23761 16.3624C8.53136 16.6749 9.92823 16.4124 11.072 15.9405C11.647 15.7062 11.647 15.2093 11.3907 14.678L10.2032 12.2124ZM16.4751 6.64992H10.9345L13.397 4.18742H11.5501L8.47198 7.26554L11.5501 10.3437H13.397L10.9345 7.88117H16.4751V6.64992Z"
                                fill="#767C7B"
                            />
                        </svg>
                        <span>In-coming</span>
                    </span>
                );
            case 'missed':
                return (
                    <span className="flex gap-2 text-[#FA5532] font-urbanist text-sm">
                        <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9.74991 12.2124C9.49366 11.6843 9.16241 11.2999 8.59054 11.5343L7.46241 11.953C6.55929 12.3718 6.10929 11.953 5.65616 11.3218L3.62491 6.70304C3.37179 6.17492 3.50304 5.67804 4.07491 5.44367L5.65304 4.81242C6.22491 4.57492 6.13429 4.08117 5.87804 3.55304L4.53116 1.03429C4.27491 0.506166 3.74991 0.37804 3.17804 0.612415C2.03116 1.08429 1.08429 1.82492 0.471786 2.92179C-0.278214 4.26242 0.0967855 6.12804 0.246785 6.91242C0.396785 7.69679 0.921785 9.07179 1.59991 10.4812C2.27804 11.8937 2.87491 13.003 3.40616 13.6312C3.93741 14.2593 5.21241 15.978 6.79054 16.3624C8.08429 16.6749 9.48116 16.4124 10.6249 15.9405C11.1968 15.7062 11.1999 15.2093 10.9437 14.678L9.74991 12.2124ZM14.7937 4.80304L13.5624 3.57179L11.7155 5.41867L9.86866 3.57179L8.63741 4.80304L10.4843 6.64992L8.63741 8.49992L9.86866 9.73116L11.7155 7.88429L13.5624 9.73116L14.7937 8.49992L12.9468 6.65304L14.7937 4.80304Z"
                                fill="#FA5532"
                            />
                        </svg>
                        <span>Missed</span>
                    </span>
                );
            default:
                return <IconPhone size={16} className="text-gray-600" />;
        }
    };

    const getStatusColor = () => {
        switch (callLog.status) {
            case 'completed':
                return 'text-gray-900';
            case 'missed':
                return 'text-[#144120]';
            case 'declined':
                return 'text-orange-600';
            default:
                return 'text-gray-900';
        }
    };

    const [isActive, setIsActive] = useState(false);

    const { data: socialsData, isFetching } = useGetIntegrationsQuery();
    const [deleteCallLog, { isLoading: isDeleting }] = useDeleteCallLogMutation();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        Swal.fire({
            title: 'Delete Call Log?',
            text: 'This will permanently delete the call history, recording, and transcript. This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            padding: '2em',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCallLog(callLog.callSid)
                    .unwrap()
                    .then(() => {
                        showNotification({
                            title: 'Deleted',
                            message: 'Call log deleted successfully',
                            color: 'green',
                        });
                    })
                    .catch((error) => {
                        showNotification({
                            title: 'Error',
                            message: error?.data?.message ?? 'Failed to delete call log',
                            color: 'red',
                        });
                    });
            }
        });
    };

    return (
        <div className="rounded-lg transition-colors">
            <div className={`flex flex-col items-between justify-center p-3 rounded-lg group ${isActive ? 'bg-primary/10' : 'hover:bg-gray-50'}  cursor-default`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CreateNewCall callLog={callLog} variant="callLogItem" />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onCallBack(callLog.phone, callLog.contactName)}>
                                <span className={` font-semibold text-sm truncate font-urbanist ${getStatusColor()}`}>{callLog.contactName}</span>
                            </div>
                            <div className="flex flex-col gap-2 justify-end items-end">
                                <span className="text-xs text-gray-700">{formatTimeAgo(callLog.timestamp)}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                {getCallIcon()}
                                {callLog.status === 'completed' && (
                                    <>
                                        <span>•</span>
                                        <span>
                                            {typeof callLog.callDuration === 'string' && callLog.callDuration.includes(':')
                                                ? callLog.callDuration
                                                : formatCallDuration(+callLog.callDuration)}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {callLog.recording.length > 0 ? (
                                    <button
                                        className="flex items-center gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setIsActive(!isActive);
                                        }}
                                    >
                                        <div className="text-primary font-bold text-xs">Recording</div>
                                        <IconChevronDown size={18} className={`${isActive ? 'rotate-180' : ''} text-primary transition-transform `} />
                                    </button>
                                ) : (
                                    callLog.status === 'completed' && (Date.now() - new Date(callLog.timestamp).getTime()) < 60000 && (
                                        <div className="flex items-center gap-1 text-gray-400 italic text-[10px] animate-pulse">
                                            Processing Recording...
                                        </div>
                                    )
                                )}
                                <button
                                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                                    onClick={handleDelete}
                                    title="Delete Call Log"
                                    disabled={isDeleting}
                                >
                                    <Trash2 size={14} className={isDeleting ? 'animate-pulse' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`w-full mt-2 ${isActive ? 'max-h-[200px]' : 'max-h-0'} overflow-hidden transiton-[max-height] duration-300 ease-in-out`}>
                    {isActive && (
                        <>
                            <TwilioAudioPlayer recording={callLog.recording} userName={socialsData?.socails?.twilio?.accountSid || ''} password={socialsData?.socails?.twilio?.authToken || ''} />
                            <TranscriptModal callLog={callLog} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
