import { useDisclosure } from '@mantine/hooks';
import React, { useMemo, useState } from 'react';
import { TwilioA2PRegistrationModal, TwillioSubAccountAndNumberRegistrationModal } from './TwillioForm';
import { TwilioWorkflow } from './TwillioWorkflow';
import { Loader } from '@mantine/core';
import { ITwilioSocialAccount } from '../models/twillio';
import { IconSettings } from '@tabler/icons-react';
import { hasRole } from '../../../shared/utils/utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';

function TwillioLogin({ twillioData }: { twillioData?: ITwilioSocialAccount | null }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [disconnectingTwillio, setDisconnectingTwillio] = useState(false);
    const connected = useMemo(() => {
        return Boolean(twillioData && twillioData.friendlyName);
    }, [twillioData]);

    const handleDisconnectTwillio = async () => {
        return opened ? close() : open();
        setDisconnectingTwillio(true);
        try {
            // Add your disconnect logic here (e.g., API call to disconnect Twilio)
            console.log('Disconnecting Twilio...');
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log('Twilio disconnected successfully.');
        } catch (error) {
            console.error('Failed to disconnect Twilio:', error);
        } finally {
            setDisconnectingTwillio(false);
        }
    };

    const auth = useSelector((state: IRootState) => state.auth);

    return (
        <>
            <TwilioWorkflow opened={opened} onClose={close} onSuccess={close} />
            {!connected ? (
                <button onClick={open} className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                    Connect
                </button>
            ) : (
                hasRole('Edit Twilio Sub Account', true, auth) && (
                    <div className="flex flex-col gap-2 w-full">
                        {/* <button disabled={disconnectingTwillio} onClick={handleDisconnectTwillio} className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg">
                        {disconnectingTwillio ? <Loader className="w-5 h-5 text-white min-w-[60px]" /> : <>Disconnect</>}
                    </button> */}
                        <button
                            onClick={open}
                            className=" absolute top-[6px] right-[6px] flex flex-nowrap items-center justify-center  text-white/70 bg-primary/60 font-semibold p-1 rounded  hover:bg-primary/80  transition duration-200"
                        >
                            <IconSettings className="w-5 h-5 inline-block" />
                        </button>
                    </div>
                )
            )}
        </>
    );
}

export default TwillioLogin;
