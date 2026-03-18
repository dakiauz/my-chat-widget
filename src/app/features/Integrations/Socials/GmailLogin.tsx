import React from 'react';
import { showNotification } from '@mantine/notifications';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import { Box, Loader, Button } from '@mantine/core';
import { useGmailConnectMutation, useGmailDisconnectMutation } from '../services/GmailApiSlice';
import { useDisclosure } from '@mantine/hooks';

type GmailLoginProps = { connected: boolean; loading?: boolean };

const GmailLogin: React.FC<GmailLoginProps> = ({ connected, loading = false }) => {
    const [connectGmail, { isLoading: isConnecting }] = useGmailConnectMutation();
    const [opened, { open, close }] = useDisclosure(false);

    const handleGmailConnect = async () => {
        try {
            localStorage.setItem('connect', 'gmail');
            const response = await connectGmail().unwrap();

            if (response.redirected_url) {
                window.location.href = response.redirected_url;
            } else {
                throw new Error('Failed to get redirect URL');
            }
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error?.data?.message || 'Failed to connect Gmail. Please try again later.',
                color: 'red',
            });
        }
    };

    const [disconnectGmail, { isLoading: isDisconnecting }] = useGmailDisconnectMutation();

    const handleDisconnectGmail = async () => {
        try {
            const response = await disconnectGmail().unwrap();
            showNotification({
                title: 'Success!',
                message: response.message || 'Gmail disconnected successfully.',
                color: 'green',
            });
        } catch (error: any) {
            showNotification({
                title: 'Error!',
                message: error?.data?.message || 'Failed to disconnect Gmail.',
                color: 'red',
            });
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    if (connected) {
                        handleDisconnectGmail();
                    } else {
                        handleGmailConnect();
                    }
                }}
                disabled={isConnecting || isDisconnecting}
                className={` px-4 py-2 rounded-lg text-white ${connected ? 'bg-red-600' : 'bg-primary'}`}
            >
                {' '}
                {isConnecting || isDisconnecting ? <Loader className="w-5 h-5 text-white min-w-[60px]" /> : <span className="">{connected ? 'Disconnect' : 'Connect '}</span>}
            </button>
        </>
    );
};

export default GmailLogin;
