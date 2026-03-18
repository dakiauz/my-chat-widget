import React from 'react';
import { showNotification } from '@mantine/notifications';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import { Box, Loader } from '@mantine/core';
import { useIMapConnectMutation, useIMapDisconnectMutation } from '../services/ImapApiSlice';
import { useDisclosure } from '@mantine/hooks';
import IMapLoginForm from '../components/IMapLoginForm';
import { IMapConnectRequest } from '../models/imap';

type ImapLoginProps = { connected: boolean; loading?: boolean };

const ImapLogin: React.FC<ImapLoginProps> = ({ connected, loading = false }) => {
    const [connectIMap, { isLoading: isConnecting }] = useIMapConnectMutation();
    const [opened, { open, close }] = useDisclosure(false);
    const handleImapLogin = async (formData: IMapConnectRequest) => {
        await connectIMap(formData)
            .unwrap()
            .then((response) => {
                showNotification({
                    title: 'Success!',
                    message: response.message || 'Email connected successfully.',
                    color: 'green',
                });
                close();
            })
            .catch((error) => {
                showNotification({
                    title: 'Error!',
                    message: error?.data?.message || 'Failed to connect email. Please try again later.',
                    color: 'red',
                });
            });
    };

    const [disconnectIMap, { isLoading: isDisconnecting }] = useIMapDisconnectMutation();

    const handleDisconnectImap = async () => {
        disconnectIMap()
            .unwrap()
            .then((response) => {
                showNotification({
                    title: 'Success!',
                    message: response.message || 'IMAP disconnected successfully.',
                    color: 'green',
                });
            })
            .catch((error) => {
                showNotification({
                    title: 'Error!',
                    message: error?.data?.message || 'Failed to disconnect IMAP.',
                    color: 'red',
                });
            });
    };

    return (
        <>
            <Modal isOpen={opened} close={close}>
                <ModalHeader title="Connect Email Account" />
                <ModalBody>
                    <IMapLoginForm submit={handleImapLogin} loading={isConnecting || loading} close={close} />
                </ModalBody>
            </Modal>
            <button
                onClick={() => {
                    if (connected) {
                        handleDisconnectImap();
                    } else {
                        open();
                    }
                }}
                disabled={isConnecting}
                className={` px-4 py-2 rounded-lg text-white ${connected ? 'bg-red-600' : 'bg-primary'}`}
            >
                {' '}
                {isConnecting || isDisconnecting ? <Loader className="w-5 h-5 text-white min-w-[60px]" /> : <span className="">{connected ? 'Disconnect' : 'Connect '}</span>}
            </button>
        </>
    );
};

export default ImapLogin;
