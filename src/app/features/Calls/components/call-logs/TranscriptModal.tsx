import React, { useState } from 'react';
import Modal from '../../../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../../../shared/components/ui/modals/modal/ModalBody';
import { CallLog } from '../../types';
import { useDisclosure } from '@mantine/hooks';
import TranscriptModalBody from './TranscriptModalBody';
import { Loader2 } from 'lucide-react';
import { useTranscribeRecordingMutation } from '../../../Integrations/services/TwillioApiSlice';
import { ITranscription } from '../../models/calls';
import { showNotification } from '@mantine/notifications';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store/index';

interface ITranscriptModalProps {
    callLog: CallLog;
}

function TranscriptModal({ callLog }: ITranscriptModalProps) {
    const [isOpen, { open, close }] = useDisclosure(false);
    const { user } = useSelector((state: IRootState) => state.auth);

    const [transcribeRecording, { isLoading: isTranscribing }] = useTranscribeRecordingMutation();

    // Robust Step 4: Check if user has permission to transcribe
    const hasTranscribePermission = user?.roles?.some((role: any) =>
        role?.permissions?.some((p: any) => p.name === 'Enable Transcription')
    );

    const hasExistingTranscript = Boolean(callLog.recording[0]?.transcript?.transcriptSid);

    const getTranscriptButtonText = () => {
        if (isTranscribing) return 'Processing...';
        if (hasExistingTranscript) return 'View Transcript';
        return 'Transcribe Call';
    };

    const getTranscriptButtonIcon = () => {
        if (isTranscribing) return <Loader2 className="w-4 h-4 animate-spin" />;
        return (
            <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M2.83398 9.16634C2.83398 8.98953 2.90422 8.81996 3.02925 8.69494C3.15427 8.56991 3.32384 8.49967 3.50065 8.49967H8.83398C9.0108 8.49967 9.18036 8.56991 9.30539 8.69494C9.43041 8.81996 9.50065 8.98953 9.50065 9.16634C9.50065 9.34315 9.43041 9.51272 9.30539 9.63775C9.18036 9.76277 9.0108 9.83301 8.83398 9.83301H3.50065C3.32384 9.83301 3.15427 9.76277 3.02925 9.63775C2.90422 9.51272 2.83398 9.34315 2.83398 9.16634ZM11.5007 5.83301C11.6775 5.83301 11.847 5.90325 11.9721 6.02827C12.0971 6.15329 12.1673 6.32286 12.1673 6.49967C12.1673 6.67649 12.0971 6.84605 11.9721 6.97108C11.847 7.0961 11.6775 7.16634 11.5007 7.16634H6.16732C5.99051 7.16634 5.82094 7.0961 5.69591 6.97108C5.57089 6.84605 5.50065 6.67649 5.50065 6.49967C5.50065 6.32286 5.57089 6.15329 5.69591 6.02827C5.82094 5.90325 5.99051 5.83301 6.16732 5.83301H11.5007ZM10.1673 9.16634C10.1673 8.98953 10.2376 8.81996 10.3626 8.69494C10.4876 8.56991 10.6572 8.49967 10.834 8.49967H11.5007C11.6775 8.49967 11.847 8.56991 11.9721 8.69494C12.0971 8.81996 12.1673 8.98953 12.1673 9.16634C12.1673 9.34315 12.0971 9.51272 11.9721 9.63775C11.847 9.76277 11.6775 9.83301 11.5007 9.83301H10.834C10.6572 9.83301 10.4876 9.76277 10.3626 9.63775C10.2376 9.51272 10.1673 9.34315 10.1673 9.16634ZM4.16732 5.83301C4.34413 5.83301 4.5137 5.90325 4.63872 6.02827C4.76375 6.15329 4.83398 6.32286 4.83398 6.49967C4.83398 6.67649 4.76375 6.84605 4.63872 6.97108C4.5137 7.0961 4.34413 7.16634 4.16732 7.16634H3.50065C3.32384 7.16634 3.15427 7.0961 3.02925 6.97108C2.90422 6.84605 2.83398 6.67649 2.83398 6.49967C2.83398 6.32286 2.90422 6.15329 3.02925 6.02827C3.15427 5.90325 3.32384 5.83301 3.50065 5.83301H4.16732Z"
                    fill="currentColor"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.16699 0.5C1.63656 0.5 1.12785 0.710714 0.752779 1.08579C0.377706 1.46086 0.166992 1.96957 0.166992 2.5V10.5C0.166992 11.0304 0.377706 11.5391 0.752779 11.9142C1.12785 12.2893 1.63656 12.5 2.16699 12.5H12.8337C13.3641 12.5 13.8728 12.2893 14.2479 11.9142C14.6229 11.5391 14.8337 11.0304 14.8337 10.5V2.5C14.8337 1.96957 14.6229 1.46086 14.2479 1.08579C13.8728 0.710714 13.3641 0.5 12.8337 0.5H2.16699ZM12.8337 1.83333H2.16699C1.99018 1.83333 1.82061 1.90357 1.69559 2.0286C1.57056 2.15362 1.50033 2.32319 1.50033 2.5V10.5C1.50033 10.6768 1.57056 10.8464 1.69559 10.9714C1.82061 11.0964 1.99018 11.1667 2.16699 11.1667H12.8337C13.0105 11.1667 13.18 11.0964 13.3051 10.9714C13.4301 10.8464 13.5003 10.6768 13.5003 10.5V2.5C13.5003 2.32319 13.4301 2.15362 13.3051 2.0286C13.18 1.90357 13.0105 1.83333 12.8337 1.83333Z"
                    fill="currentColor"
                />
            </svg>
        );
    };

    const [transcription, setTranscription] = useState<ITranscription[]>([]);

    // If no existing transcript and no permission, hide the button completely
    if (!hasExistingTranscript && !hasTranscribePermission) {
        return null;
    }

    return (
        <>
            <button
                disabled={isTranscribing}
                className="flex flex-grow w-full items-center gap-2 justify-center p-2 rounded-md bg-white text-primary hover:bg-primary/20 hover:text-white transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (hasExistingTranscript) {
                        open();
                    } else {
                        transcribeRecording(callLog.recording[0].recordingSid)
                            .unwrap()
                            .then((response) => {
                                setTranscription(response.transcription);
                                open();
                            })
                            .catch((error) => {
                                showNotification({
                                    title: 'Error',
                                    message: error?.data?.message ?? 'Failed to transcribe recording. Please try again later.',
                                    color: 'red',
                                });
                                console.error('Error transcribing recording:', error);
                            });
                    }
                }}
            >
                <span className="flex items-center justify-center gap-2">
                    {getTranscriptButtonText()} {getTranscriptButtonIcon()}
                </span>
            </button>
            {isOpen && (
                <Modal close={close} isOpen={isOpen} size="max-w-4xl">
                    <ModalBody>
                        <TranscriptModalBody transcription={transcription} setTranscription={setTranscription} callLog={callLog} />
                    </ModalBody>
                </Modal>
            )}
        </>
    );
}

export default TranscriptModal;
