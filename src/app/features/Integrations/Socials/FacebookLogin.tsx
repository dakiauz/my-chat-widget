import React, { useMemo, useState } from 'react';
import { useFacebookLoginMutation, useFacebookLogoutMutation, useGetFacebookPagesQuery } from '../services/facebookApiSlice';
import { showNotification } from '@mantine/notifications';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import { Box, Loader } from '@mantine/core';
import { isString } from 'formik';
import FacebookPagesForm from '../components/FacebookPagesForm';
import fbImage from '../assets/fb.png';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { hasRole } from '../../../shared/utils/utils';
import Tooltip from '../../../shared/components/ui/Tooltip';

type FacebookLoginProps = { connected: boolean; fbCallback: boolean; loading?: boolean };

const FacebookLogin: React.FC<FacebookLoginProps> = ({ connected, fbCallback, loading = false }) => {
    const [facebookLoginMutation, { isLoading: isFacebookLoginLoading, isSuccess: isFacebookLoginSuccess }] = useFacebookLoginMutation();
    const [disconnectFacebookMutation, { isLoading: disconnectingFacebook }] = useFacebookLogoutMutation();

    const handleFacebookLogin = async () => {
        facebookLoginMutation()
            .unwrap()
            .then((response) => {
                if (response.loginUrl) {
                    const loginUrl = response.loginUrl;
                    window.location.href = loginUrl;
                } else {
                    showNotification({
                        title: 'Error!',
                        message: 'Facebook login failed. Please try again later.',
                        color: 'red',
                    });
                }
            });
    };

    const handleDisconnectFacebook = async () => {
        if (!disconnectingFacebook)
            disconnectFacebookMutation()
                .unwrap()
                .then((response) => {
                    if (response.success) {
                        showNotification({
                            title: 'Success!',
                            message: response?.message ?? 'Facebook disconnected successfully.',
                            color: 'green',
                        });
                    } else {
                        throw new Error(response?.message ?? 'Failed to disconnect Facebook.');
                    }
                })
                .catch((error) => {
                    showNotification({
                        title: 'Error!',
                        message: error?.message ?? isString(error) ? error : 'Failed to disconnect Facebook.',
                        color: 'red',
                    });
                })
                .finally(() => {
                    // setIsOpen(false);
                });
    };
    const auth = useSelector((state: IRootState) => state.auth);

    const disconnectPermission = useMemo(() => {
        return hasRole('Disconnect Facebook', true, auth);
    }, [auth]);

    return (
        <>
            <Modal
                isOpen={fbCallback}
                close={() => {
                    handleDisconnectFacebook();
                }}
            >
                <ModalHeader title="Connect Facebook Page" />
                <ModalBody>
                    <>{fbCallback && <FacebookPagesForm loading={disconnectingFacebook || loading} />}</>
                </ModalBody>
            </Modal>
            {!connected ? (
                <button
                    onClick={handleFacebookLogin}
                    disabled={isFacebookLoginLoading || isFacebookLoginSuccess}
                    className="flex flex-nowrap items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    <img src={fbImage} alt="Facebook" className="w-5 h-5" />
                    {isFacebookLoginSuccess ? <Loader className="w-5 h-5 text-white min-w-[60px]" /> : <span className="text-xs whitespace-nowrap pr-3">Login with Facebook</span>}
                </button>
            ) : (
                <Tooltip content={disconnectPermission ? 'Disconnect from Facebook' : "You don't have permission to disconnect Facebook"}>
                    <button
                        disabled={disconnectingFacebook || !disconnectPermission}
                        onClick={handleDisconnectFacebook}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-80"
                    >
                        {disconnectingFacebook ? <Loader className="w-5 h-5 text-white min-w-[60px]" /> : <>Disconnect</>}
                    </button>
                </Tooltip>
            )}
        </>
    );
};

export default FacebookLogin;
