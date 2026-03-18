import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { IconPhone, IconWifiOff, IconPhoneIncoming, IconBell } from '@tabler/icons-react';
import { useTwilioDevice } from '../../hooks/useTwilioDevice';
import { setDialerOpen } from '../../../../slices/dialerSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { useLocation } from 'react-router-dom';

const FloatingActionButtons = React.memo(() => {
    const dispatch = useDispatch();
    const { callState, isDialerOpen, connectionStatus, isPowerDialerActive } = useSelector((state: IRootState) => state.dialer);
    const { isMobile } = useSelector((state: IRootState) => state.ui);
    const { deviceReady } = useTwilioDevice();

    const handleOpenDialer = React.useCallback(() => {
        dispatch(setDialerOpen(true));
    }, [dispatch]);

    // const handleSimulateIncomingCall = React.useCallback(() => {
    //     // Select a random contact for the incoming call simulation
    //     const randomIndex = Math.floor(Math.random() * CONTACTS.length);
    //     const randomContact = CONTACTS[randomIndex];
    //     simulateIncomingCall(randomContact);
    // }, [simulateIncomingCall]);

    const callCount = React.useMemo(() => {
        if (callState.isActive || callState.isIncoming || callState.isDialing) return 1;
        return 0;
    }, [callState]);

    const hasIncomingCall = React.useMemo(() => callState.isIncoming, [callState.isIncoming]);

    // Don't show floating buttons if dialer is open on mobile
    if (isMobile && isDialerOpen) return null;

    const location = useLocation();
    // Show globally if power dialer active, an incoming call exists, an active call exists, or explicitly on /calls page.
    if (location.pathname !== '/calls' && !isPowerDialerActive && !hasIncomingCall && !callState.isActive && !callState.isDialing) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
            {/* Call Count Button */}
            {callCount > 0 && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
                    <Button variant="outline" size="icon" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" onClick={handleOpenDialer}>
                        {callCount}
                    </Button>
                </motion.div>
            )}

            {/* Simulate Incoming Call Button (only in simulation mode) */}
            {/* {isSimulationMode && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        onClick={handleSimulateIncomingCall}
                        title="Simulate incoming call"
                    >
                        <IconPhoneIncoming size={16} />
                    </Button>
                </motion.div>
            )} */}

            {/* Device Status Indicator */}
            {connectionStatus != 'connected' && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`w-10 h-10 rounded-full transition-colors ${
                            // connectionStatus === 'connected'
                            //     ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            //     :
                            connectionStatus === 'connecting'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : connectionStatus === 'error'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={handleOpenDialer}
                        title={
                            // connectionStatus === 'connected'
                            //     ? 'Twilio connected'
                            //     :
                            connectionStatus === 'connecting' ? 'Connecting to Twilio...' : connectionStatus === 'error' ? 'Connection error' : 'Disconnected'
                        }
                    >
                        {connectionStatus === 'disconnected' ? (
                            <IconWifiOff size={16} />
                        ) : (
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    // connectionStatus === 'connected'
                                    //     ? 'bg-green-500'
                                    //     :
                                    connectionStatus === 'connecting' ? 'bg-yellow-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                                    }`}
                            />
                        )}
                    </Button>
                </motion.div>
            )}

            {/* Main Dialer Button */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={
                    hasIncomingCall
                        ? {
                            scale: [1, 1.1, 1],
                            transition: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: 'easeInOut' },
                        }
                        : {}
                }
            >
                <Button
                    size="icon"
                    className={`w-14 h-14 rounded-full text-white transition-colors ${isPowerDialerActive
                        ? 'bg-purple-500 hover:bg-purple-600 border-purple-600 shadow-xl shadow-purple-500/50 animate-pulse'
                        : deviceReady
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    onClick={handleOpenDialer}
                    disabled={!deviceReady && !isPowerDialerActive}
                >
                    {hasIncomingCall ? <IconBell size={20} /> : <IconPhone size={20} />}
                </Button>
            </motion.div>
        </div>
    );
});

FloatingActionButtons.displayName = 'FloatingActionButtons';

export { FloatingActionButtons };
