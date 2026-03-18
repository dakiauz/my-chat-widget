import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { IconPhone, IconPhoneOff, IconArrowLeft, IconX, IconMinus, IconBackspace, IconAlertCircle, IconRefresh } from '@tabler/icons-react';

import { useTwilioDevice } from '../../hooks/useTwilioDevice';
import { addDigit, removeDigit, clearNumber, setDialerOpen, setMuted, setOnHold, setSpeakerOn, toggleKeypadInCall, answerCall as answerCallAction, setNumber } from '../../../../slices/dialerSlice';

import { IRootState } from '../../../../store';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setDialerMinimized, setDialerPosition } from '../../../../slices/uiSlice';
import { getInitials, hasRole } from '../../../../shared/utils/utils';
import { getContactName } from '../contacts/ContactList';
import audioManager from '../../utils/audio-manager';
import { useGetLeadByPhoneNumberQuery } from '../../../LeadManagement/Leads/services/leadsApi';
import { useGetLeadStatusQuery } from '../../../LeadManagement/LeadStatus/services/leadsStatusApi';
import { IContact } from '../../models/calls';
import { ILead } from '../../../LeadManagement/Leads/models/lead';
import CallControls from './CallControls';
import useCallTimer from '../../hooks/useCallTimer';
import Keypad from './Keypad';
import ContactInfo from './ContactInfo';
import ReconnectError from './ReconnectError';
import DeviceStatus from './DeviceStatus';

import { useStartPowerDialerMutation, useNextPowerDialerMutation, useDispositionPowerDialerMutation, useLazyCheckStatusPowerDialerQuery } from '../../../../features/Integrations/services/TwillioApiSlice';
import { setPowerDialerActive, setCurrentQueueId } from '../../../../slices/dialerSlice';

const PowerDialerFloating = React.memo(() => {
    const dispatch = useDispatch();
    const { callState, sessions, focusedCallSid, dialedNumber, isPowerDialerWindowOpen, connectionStatus, isSpeakerOn, showKeypadInCall, isPowerDialerActive, currentQueueId } = useSelector((state: IRootState) => state.dialer);

    const { dialerPosition, dialerMinimized, isMobile } = useSelector((state: IRootState) => state.ui);

    const focusedSession = React.useMemo(() => sessions.find((s) => s.callSid === focusedCallSid) || null, [sessions, focusedCallSid]);

    // Fallback bindings for current active session
    const activeContact = focusedSession?.contact || callState.contact;
    const isMuted = focusedSession?.isMuted || false;
    const isRecording = focusedSession?.isRecording || null;
    const isOnHold = focusedSession?.status === 'on-hold';

    // Determine universal call state for styling / backwards compatibility
    const dialerState = React.useMemo(() => {
        if (focusedSession?.status === 'active') return 'active';
        if (focusedSession?.status === 'on-hold') return 'on-hold';
        if (focusedSession?.status === 'incoming') return 'incoming';
        if (focusedSession?.status === 'dialing') return 'dialing';

        // Fallback to legacy tracking if array is empty (for transition period)
        if (callState.isActive) return 'active';
        if (callState.isIncoming) return 'incoming';
        if (callState.isDialing) return 'dialing';
        return 'idle';
    }, [focusedSession, callState]);

    const callTimer = useCallTimer(dialerState === 'active' || dialerState === 'on-hold');
    // Twilio integration
    const {
        deviceReady,
        error,
        isRefreshingToken,
        makeCall,
        answerCall,
        mergeCall,
        rejectCall,
        hangUp,
        toggleMute,
        toggleHold,
        toggleSpeaker,
        sendDigits,
        device,
        canReconnect: showReconnectError,
        reconnect,
        isTokenLoading,
        startRecording,
        stopRecording,
    } = useTwilioDevice();

    const [nextPowerDialer, { isLoading: isNextLoading }] = useNextPowerDialerMutation();
    const [dispositionPowerDialer, { isLoading: isDispositionLoading }] = useDispositionPowerDialerMutation();
    const [checkStatusPowerDialer] = useLazyCheckStatusPowerDialerQuery();

    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const dialerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const [micPermissionRequested, setMicPermissionRequested] = useState(false);
    const [powerDialerCompleted, setPowerDialerCompleted] = useState(false);
    const [activeLead, setActiveLead] = useState<ILead | null>(null);
    const lastAutoAdvancedQueueRef = useRef<number | null>(null);

    const [selectedKanbanStatus, setSelectedKanbanStatus] = useState<string>('');
    const [selectedDisposition, setSelectedDisposition] = useState<string>('');

    const { data: leadStatusesData, isFetching: isStatusesFetching } = useGetLeadStatusQuery(activeLead?.lead_list_id as number, {
        skip: !activeLead?.lead_list_id,
    });

    // --- Recording logic ---

    const handleRecord = useCallback(() => {
        if (isRecording != null) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [startRecording, stopRecording]);

    // --- Speaker logic (simulate by muting/unmuting audio output) ---
    const handleSpeaker = useCallback(() => {
        const speakerOn = toggleSpeaker();
        dispatch(setSpeakerOn(speakerOn));
        // if (device && device.audio && typeof device.audio.setOutputDevice === 'function') {
        //     device.audio.setOutputDevice('default').catch(() => {});
        // }
        return speakerOn;
    }, [toggleSpeaker, dispatch, device]);

    // Audio device selection state
    const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedInput, setSelectedInput] = useState<string>('');
    const [selectedOutput, setSelectedOutput] = useState<string>('');

    // Fetch available audio devices when dialer opens
    useEffect(() => {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            setInputDevices(devices.filter((d) => d.kind === 'audioinput'));
            setOutputDevices(devices.filter((d) => d.kind === 'audiooutput'));
        });
    }, [isPowerDialerWindowOpen]);

    // Set input device on Twilio Device
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const deviceId = e.target.value;
            setSelectedInput(deviceId);
            if (device && device.audio && typeof device.audio.setInputDevice === 'function') {
                device.audio
                    .setInputDevice(deviceId)
                    .then(() => {
                        console.log('Input device set:', deviceId);
                    })
                    .catch((err: any) => {
                        console.error('Failed to set input device:', err);
                    });
            }
        },
        [device]
    );

    // Set output device on Twilio Device
    // const handleOutputChange = useCallback(
    //     (e: React.ChangeEvent<HTMLSelectElement>) => {
    //         const deviceId = e.target.value;
    //         setSelectedOutput(deviceId);
    //         if (device && device.audio && typeof device.audio.setOutputDevice === 'function') {
    //             device.audio
    //                 .setOutputDevice(deviceId)
    //                 .then(() => {
    //                     console.log('Output device set:', deviceId);
    //                 })
    //                 .catch((err: any) => {
    //                     console.error('Failed to set output device:', err);
    //                 });
    //         }
    //     },
    //     [device]
    // );

    // Reset selected devices when dialer closes
    useEffect(() => {
        if (!isPowerDialerWindowOpen) {
            setSelectedInput('');
            setSelectedOutput('');
        }
    }, [isPowerDialerWindowOpen]);

    // Constants for dialer dimensions
    const DIALER_WIDTH = 320;
    const DIALER_HEIGHT = 500; // Approximate height
    const EDGE_PADDING = 20;

    // Calculate boundaries for dragging
    const getBoundaries = useCallback(() => {
        return {
            minX: -500,
            maxX: typeof window !== 'undefined' ? window.innerWidth + 500 : 3000,
            minY: -500,
            maxY: typeof window !== 'undefined' ? window.innerHeight + 500 : 3000,
        };
    }, []);

    // Reset position to bottom right when window resizes
    useEffect(() => {
        const handleResize = () => {
            if (!isMobile && !isDragging) {
                const newPosition = {
                    x: window.innerWidth - DIALER_WIDTH - EDGE_PADDING,
                    y: window.innerHeight - DIALER_HEIGHT - EDGE_PADDING,
                };
                dispatch(setDialerPosition(newPosition));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch, isMobile, isDragging]);

    // Initialize position on first open

    useEffect(() => {
        if (isPowerDialerWindowOpen && !isMobile && window.innerWidth > 767) {
            // Check if position is at default (0,0) or out of bounds
            const boundaries = getBoundaries();
            if (dialerPosition.x < boundaries.minX || dialerPosition.x > boundaries.maxX || dialerPosition.y < boundaries.minY || dialerPosition.y > boundaries.maxY) {
                // Reset to bottom right position
                const newPosition = {
                    x: window.innerWidth - DIALER_WIDTH - EDGE_PADDING,
                    y: window.innerHeight - DIALER_HEIGHT - EDGE_PADDING,
                };
                try {
                    dispatch(setDialerPosition(newPosition));
                } catch (error) { }
            }
        }
    }, [isPowerDialerWindowOpen, isMobile, dialerPosition, getBoundaries]);

    // Memoized handlers
    const handleDigitClick = useCallback(
        (digit: string) => {
            if (digit === '⌫') {
                dispatch(removeDigit());
            } else {
                dispatch(addDigit(digit));
            }
        },
        [dispatch]
    );

    const handleClear = useCallback(() => {
        dispatch(clearNumber());
    }, [dispatch]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (isMobile) return;

            e.preventDefault();
            if (dialerRef.current) {
                const rect = dialerRef.current.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;

                setDragOffset({ x: offsetX, y: offsetY });
                dragStartRef.current = { x: e.clientX, y: e.clientY };
                setIsDragging(true);
            }
        },
        [isMobile]
    );
    const { selectedContact } = useSelector((state: IRootState) => state.ui);

    const handleStartCall = useCallback(() => {
        if (!dialedNumber.trim() || !deviceReady) return;

        // const contact = CONTACTS.find((c) => c.phone === dialedNumber) || {
        //     id: `temp-${Date.now()}`,
        //     name: dialedNumber,
        //     initials: dialedNumber.slice(0, 2).toUpperCase(),
        //     phone: dialedNumber,
        // };
        const contact: IContact | null = selectedContact?.to == dialedNumber ? selectedContact : null;

        makeCall(dialedNumber, contact);
    }, [dialedNumber, deviceReady, makeCall]);

    const handleEndCall = useCallback(() => {
        hangUp(focusedCallSid || undefined);
    }, [hangUp, focusedCallSid]);

    const handleAnswerCall = useCallback(() => {
        answerCall(focusedCallSid || undefined);
        dispatch(answerCallAction());
    }, [answerCall, dispatch, focusedCallSid]);

    const handleRejectCall = useCallback(() => {
        rejectCall(focusedCallSid || undefined);
    }, [rejectCall, focusedCallSid]);

    const handleMergeCall = useCallback(() => {
        mergeCall(focusedCallSid || undefined);
    }, [mergeCall, focusedCallSid]);

    // True when the focused session is incoming AND there is already another active session
    const hasActiveCallWhileIncoming = React.useMemo(() => {
        if (dialerState !== 'incoming') return false;
        return sessions.some(s => s.status === 'active');
    }, [dialerState, sessions]);

    // True when at least two sessions are merged
    const isConferenceActive = React.useMemo(() => sessions.filter(s => s.isMerged).length >= 2, [sessions]);

    const handleMute = useCallback(() => {
        const muted = toggleMute();
        dispatch(setMuted(muted));
    }, [toggleMute, dispatch]);

    const handleHold = useCallback(() => {
        const onHold = toggleHold();
        dispatch(setOnHold(onHold));
    }, [toggleHold, dispatch]);

    const handleKeypadToggle = useCallback(() => {
        dispatch(toggleKeypadInCall());
    }, [dispatch]);

    const switchToSession = useCallback((sid: string) => {
        dispatch({ type: 'dialer/setFocusedCallSid', payload: sid });
    }, [dispatch]);

    const handleClose = useCallback(() => {
        // Don't allow closing during active call
        if (dialerState !== 'idle') {
            return;
        }
        dispatch(setPowerDialerActive(false));
        dispatch({ type: 'dialer/setPowerDialerWindowOpen', payload: false });
        dispatch(setCurrentQueueId(null));
        setPowerDialerCompleted(false);
        setActiveLead(null);
    }, [dialerState, dispatch]);

    // Function to request permissions
    const requestPermissions = useCallback(async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach((track) => track.stop());
                setMicPermissionRequested(true);
                console.log('Microphone permission granted');
            }
        } catch (error) {
            console.warn('Microphone permission denied:', error);
        }
    }, []);

    // --- Power Dialer Logic ---
    const handleNextPowerDialer = async () => {
        try {
            setPowerDialerCompleted(false);
            const res = await nextPowerDialer().unwrap();
            if (res.success && res.queue_id && res.lead?.phone) {
                dispatch(setCurrentQueueId(res.queue_id));
                setActiveLead(res.lead);
                // Call via WebRTC! This guarantees the agent hears the normal ringing 
                // and avoids the silence delay. The AMD will run passively in the background.
                makeCall(res.lead.phone, null, true, res.queue_id);
            } else {
                alert("Queue empty or failed.");
            }
        } catch (err: any) {
            console.error("Next Power Dialer error", err);
            if (err?.status === 404) {
                setPowerDialerCompleted(true);
                dispatch(setCurrentQueueId(null));
                setActiveLead(null);
            } else {
                dispatch(setPowerDialerActive(false));
                dispatch(setCurrentQueueId(null));
                setActiveLead(null);
            }
        }
    };

    const handlePowerDialerDisposition = async () => {
        if (!currentQueueId) return;
        try {
            // Tell the useEffect to ignore this queue ID since we are handling it manually.
            lastAutoAdvancedQueueRef.current = currentQueueId;

            await dispositionPowerDialer({
                queue_id: currentQueueId,
                kanban_status_id: selectedKanbanStatus || null,
                disposition_status: selectedDisposition || null
            }).unwrap();

            setSelectedKanbanStatus('');
            setSelectedDisposition('');
            hangUp();

            // Let the previous call's Twilio events fully clear out naturally before grabbing the next one
            setTimeout(() => {
                handleNextPowerDialer();
            }, 1000);
        } catch (err) {
            console.error("Disposition Error", err);
        }
    };

    // Auto-advance if backend already logged a disposition (like voicemail_drop)
    useEffect(() => {
        if (isPowerDialerActive && currentQueueId && dialerState === 'idle' && !powerDialerCompleted && !isNextLoading && !isDispositionLoading) {
            // Prevent double-firing if we've already initiated an advance for this queue ID (manual or auto)
            if (lastAutoAdvancedQueueRef.current === currentQueueId) return;

            checkStatusPowerDialer(currentQueueId).unwrap().then(res => {
                // If it is 'completed', it has a disposition. 'dialing'/'pending' mean we need to ask.
                if (res.status === 'completed' && res.disposition) {
                    if (lastAutoAdvancedQueueRef.current !== currentQueueId) {
                        lastAutoAdvancedQueueRef.current = currentQueueId;
                        console.log(`Automatic advance for Queue ${currentQueueId} due to disposition: ${res.disposition}`);
                        setTimeout(() => {
                            handleNextPowerDialer();
                        }, 500); // slight delay to allow UI to breathe
                    }
                }
            }).catch(console.error);
        }
    }, [dialerState, currentQueueId, isPowerDialerActive, powerDialerCompleted, isNextLoading, isDispositionLoading]);

    // useEffect to check for permissions on mount
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                if (navigator.permissions) {
                    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                    if (result.state === 'granted') {
                        setMicPermissionRequested(true);
                    }
                }
            } catch (error) {
                console.warn('Could not check permissions:', error);
            }
        };

        checkPermissions();
    }, []);

    // Optimized drag handling with RAF and boundary constraints
    useEffect(() => {
        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && !isMobile) {
                rafId = requestAnimationFrame(() => {
                    const newX = e.clientX - dragOffset.x;
                    const newY = Math.max(0, e.clientY - dragOffset.y);
                    dispatch(setDialerPosition({ x: newX, y: newY }));
                });
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (isDragging) {
                setIsDragging(false);
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [isDragging, dragOffset, dispatch, isMobile, getBoundaries]);

    // --- Phase 3: Auto-Answer for Power Dialer ---
    useEffect(() => {
        if (isPowerDialerActive && focusedSession?.status === 'incoming') {
            console.log('[Power Dialer] Auto-answering incoming bridge call...');
            setTimeout(() => {
                handleAnswerCall();
            }, 500); // Slight delay helps ensure audio context is ready
        }
    }, [isPowerDialerActive, focusedSession?.status, handleAnswerCall]);

    // Legacy dialer state removed (moved to top of file)

    // Memoized phone number formatter
    const formatPhoneNumber = useCallback((number: string) => {
        if (!number) return '';
        const cleaned = number.replace(/\D/g, '');
        if (number.startsWith('+')) {
            return `+${cleaned.slice(0, 2)}${cleaned.length > 2 ? '-' : ''}${cleaned.slice(2, 5)}${cleaned.length > 5 ? '-' : ''}${cleaned.slice(5, 8)}${cleaned.length > 8 ? '-' : ''}${cleaned.slice(
                8
            )}`;
        }
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }, []);

    // Memoized display number
    const displayNumber = useMemo(() => {
        if (!dialedNumber) {
            return isMobile ? 'Enter phone number' : 'Enter number';
        }
        return isMobile ? dialedNumber : formatPhoneNumber(dialedNumber);
    }, [dialedNumber, isMobile, formatPhoneNumber]);

    // Show keypad logic
    const showKeypad = useMemo(() => {
        if (dialerState === 'idle') return true;
        if (dialerState === 'dialing') return true;
        if (dialerState === 'active' && showKeypadInCall) return true;
        return false;
    }, [dialerState, showKeypadInCall]);

    // Get header color based on state
    const getHeaderColor = useCallback(() => {
        if (dialerState === 'incoming') return 'from-green-500 to-green-600';
        if (dialerState === 'active') return 'from-green-600 to-green-700';
        if (isRefreshingToken) return 'from-yellow-600 to-yellow-700';
        return 'from-purple-600 to-purple-700';
    }, [dialerState, isRefreshingToken]);

    if (!isPowerDialerWindowOpen) return null;

    const DialerContent = (
        <motion.div
            ref={dialerRef}
            style={
                isMobile
                    ? {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 50,
                    }
                    : {
                        position: 'fixed',
                        left: `${dialerPosition.x}px`,
                        top: `${dialerPosition.y}px`,
                        width: `${DIALER_WIDTH}px`,
                        zIndex: 50,
                        cursor: isDragging ? 'grabbing' : 'default',
                        willChange: isDragging ? 'transform' : 'auto',
                    }
            }
            initial={{
                opacity: 0,
                scale: isMobile ? 1 : 0.9,
                y: isMobile ? 0 : 20, // Slide up from bottom on desktop
            }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                scale: isMobile ? 1 : 0.9,
                y: isMobile ? 0 : 20,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
            <div className={`bg-white shadow-xl ${isMobile ? '' : 'rounded-lg border border-gray-200'} flex flex-col overflow-hidden`} style={{ height: isMobile ? '100vh' : 'auto' }}>
                {/* Reconnect error banner */}

                {/* Mobile Header */}
                {isMobile && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        onClick={handleClose}
                                        disabled={dialerState !== 'idle'}
                                    >
                                        <IconArrowLeft size={20} />
                                    </button>
                                    <span className="font-semibold">
                                        {isPowerDialerActive ? 'Power Dialer' :
                                            dialerState === 'incoming' ? 'Incoming Call' :
                                                dialerState === 'dialing' ? 'Calling...' :
                                                    dialerState === 'active' ? 'In Call' : 'Phone'}
                                    </span>
                                </div>
                                {dialerState === 'idle' && (
                                    <button className="p-1 hover:bg-gray-100 rounded transition-colors" onClick={handleClose}>
                                        <IconX size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                    <motion.div whileTap={{ scale: 0.98 }}>
                        <div className={`p-4 bg-gradient-to-r ${getHeaderColor()} text-white rounded-t-lg cursor-move select-none`} onMouseDown={handleMouseDown}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {dialerState !== 'idle' ? (
                                        <>
                                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                <span className="text-sm">
                                                    {getInitials(
                                                        activeLead
                                                            ? activeLead.firstName + ' ' + (activeLead.lastName ?? '')
                                                            : dialedNumber
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {activeLead
                                                        ? activeLead.firstName + ' ' + (activeLead.lastName ?? '')
                                                        : dialedNumber}
                                                </div>
                                                <div className="text-xs opacity-80">
                                                    {dialerState === 'incoming' && 'Incoming call...'}
                                                    {dialerState === 'dialing' && `Calling ${formatPhoneNumber(activeLead?.phone || dialedNumber)}`}
                                                    {dialerState === 'active' && callTimer}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            {isPowerDialerActive && currentQueueId ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                        <span className="text-sm">
                                                            {getInitials(
                                                                activeLead
                                                                    ? activeLead.firstName + ' ' + (activeLead.lastName ?? '')
                                                                    : "Call Ended"
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium flex items-center gap-2">
                                                            {activeLead
                                                                ? activeLead.firstName + ' ' + (activeLead.lastName ?? '')
                                                                : "Call Ended"}
                                                        </div>
                                                        <div className="text-xs opacity-80">
                                                            {activeLead?.phone ? formatPhoneNumber(activeLead?.phone) : "Please select a disposition below"}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-sm font-medium flex items-center gap-2">Phone</div>
                                                    <div className="text-xs opacity-80">{isRefreshingToken ? 'Refreshing connection...' : deviceReady ? 'Enter number to call' : 'Connecting...'}</div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="text-white p-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors" onClick={() => dispatch(setDialerMinimized(!dialerMinimized))}>
                                        <IconMinus size={12} />
                                    </button>
                                    <button
                                        className="text-white p-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                                        onClick={handleClose}
                                        disabled={dialerState !== 'idle'}
                                    >
                                        <IconX size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Content */}
                <AnimatePresence>
                    {(!dialerMinimized || isMobile) && (
                        <motion.div
                            className="flex-1 flex flex-col min-h-0"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Device Status */}
                            {!isMobile && <DeviceStatus connectionStatus={connectionStatus} isRefreshingToken={isRefreshingToken} />}

                            {/* Error Display (for other errors) */}
                            {/* {error && <ErrorDisplay error={error} isRefreshingToken={isRefreshingToken} />} */}
                            {showReconnectError && <ReconnectError onReconnect={reconnect} />}

                            {/* Mic Permission Request */}
                            {!micPermissionRequested && !isMobile && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 border rounded-lg mx-4 mb-4 bg-yellow-50 border-yellow-200">
                                    <div className="flex items-center gap-2 text-yellow-700">
                                        <IconAlertCircle size={16} />
                                        <span className="text-sm">Microphone permission required for calls</span>
                                    </div>
                                    <div className="mt-2 flex justify-center">
                                        <Button size="sm" onClick={requestPermissions} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                            Allow Microphone
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Contact Info for Active/Incoming Calls - Mobile */}
                            {isMobile && activeContact && (dialerState === 'active' || dialerState === 'incoming' || dialerState === 'dialing') && (
                                <ContactInfo
                                    contact={activeContact}
                                    dialerState={dialerState}
                                    duration={dialerState === 'active' ? callTimer : callState.duration}
                                    formatPhoneNumber={formatPhoneNumber}
                                />
                            )}

                            {/* Phase 3: Power Dialer Dispositions UI */}
                            {isPowerDialerActive && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 mb-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-purple-700 font-bold text-sm tracking-wide">POWER DIALER</span>
                                        <div className="flex gap-2">
                                            {currentQueueId && dialerState === 'idle' ? (
                                                <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">Select Disposition</span>
                                            ) : currentQueueId && dialerState !== 'idle' ? (
                                                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full animate-pulse">Call In Progress...</span>
                                            ) : (
                                                <span className="text-xs text-gray-500">Waiting...</span>
                                            )}
                                        </div>
                                    </div>

                                    {dialerState === 'idle' && !currentQueueId && (
                                        powerDialerCompleted ? (
                                            <div className="text-center p-3 animate-pulse-once">
                                                <div className="text-2xl mb-1">🎉</div>
                                                <div className="font-bold text-purple-700 text-lg">List Completed</div>
                                                <div className="text-xs text-gray-500 mb-3">You have dynamically dialed all leads in this list.</div>
                                                <Button size="sm" onClick={() => { setPowerDialerCompleted(false); dispatch(setPowerDialerActive(false)); }} className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300">Exit Power Dialer</Button>
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                                onClick={handleNextPowerDialer}
                                                disabled={isNextLoading}
                                            >
                                                {isNextLoading ? 'Dialing Next...' : 'Fetch Next Lead'}
                                            </Button>
                                        )
                                    )}

                                    {currentQueueId && (
                                        <div className="flex flex-col gap-3 mt-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Kanban Status (Optional)</label>
                                                <select
                                                    className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-sm bg-white focus:ring-purple-500 focus:border-purple-500"
                                                    value={selectedKanbanStatus}
                                                    onChange={e => setSelectedKanbanStatus(e.target.value)}
                                                    disabled={isStatusesFetching}
                                                >
                                                    <option value="">None</option>
                                                    {leadStatusesData?.data?.statuses?.map((status: any) => (
                                                        <option key={status.id} value={status.id}>{status.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Disposition (Optional)</label>
                                                <select
                                                    className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-sm bg-white focus:ring-purple-500 focus:border-purple-500"
                                                    value={selectedDisposition}
                                                    onChange={e => setSelectedDisposition(e.target.value)}
                                                >
                                                    <option value="">None</option>
                                                    <option value="Interested">Interested</option>
                                                    <option value="Not Interested">Not Interested</option>
                                                    <option value="No Answer">No Answer</option>
                                                    <option value="Voice mail">Voice mail</option>
                                                    <option value="Wrong Number">Wrong Number</option>
                                                    <option value="Do Not Call">Do Not Call</option>
                                                    <option value="Call Back">Call Back</option>
                                                </select>
                                            </div>

                                            <div className="pt-2 flex flex-col gap-2 border-t border-purple-200 mt-1">
                                                <Button
                                                    size="sm"
                                                    className="bg-purple-600 hover:bg-purple-700 text-white w-full shadow-sm"
                                                    disabled={isDispositionLoading}
                                                    onClick={handlePowerDialerDisposition}
                                                >
                                                    Save & Next
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-700 hover:bg-red-50 w-full"
                                                    disabled={isDispositionLoading}
                                                    onClick={() => { dispatch(setPowerDialerActive(false)); setPowerDialerCompleted(false); hangUp(); }}
                                                >
                                                    Stop Power Dialer
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Call Controls - Only show during active call */}
                            {dialerState === 'active' && (
                                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                    <div className="flex justify-center gap-4 mb-2">
                                        <CallControls
                                            isMobile={isMobile}
                                            isMuted={isMuted}
                                            isOnHold={isOnHold}
                                            isSpeakerOn={isSpeakerOn}
                                            showKeypadInCall={showKeypadInCall}
                                            isRecording={isRecording}
                                            onMute={handleMute}
                                            onKeypad={handleKeypadToggle}
                                            onHold={handleHold}
                                            onSpeaker={handleSpeaker}
                                            onRecord={handleRecord}
                                        />
                                    </div>
                                    {/* Live Call Timer */}
                                    <div className="flex justify-center mb-2">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-mono tracking-wider">{callTimer}</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Device Selection - Desktop Only, Professional UI */}
                            {/* {!isMobile && deviceReady && (
                                <div className="flex gap-4 px-4 pt-2 pb-1 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1 font-medium">Microphone</label>
                                        <select className="w-full border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-400" value={selectedInput} onChange={handleInputChange}>
                                            <option value="">System Default</option>
                                            {inputDevices.map((d) => (
                                                <option key={d.deviceId} value={d.deviceId}>
                                                    {d.label || `Microphone (${d.deviceId.slice(-4)})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1 font-medium">Speaker</label>
                                        <select className="w-full border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-400" value={selectedOutput} onChange={handleOutputChange}>
                                            <option value="">System Default</option>
                                            {outputDevices.map((d) => (
                                                <option key={d.deviceId} value={d.deviceId}>
                                                    {d.label || `Speaker (${d.deviceId.slice(-4)})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )} */}

                            {/* Action Buttons */}
                            <motion.div className={`p-${isMobile ? '6' : '4'}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                                {dialerState === 'active' && (
                                    <div className="flex justify-center">
                                        <motion.div className="flex items-center" whileTap={{ scale: 0.95 }}>
                                            <button
                                                className={`bg-[#FA5532] hover:bg-[#FA553295] text-white transition-all duration-200 flex justify-center px-4 py-4 rounded-xl ${isMobile ? 'w-20 h-20 rounded-full' : ' w-28 '}`}
                                                onClick={handleEndCall}
                                            >
                                                <svg width="31" height="12" viewBox="0 0 31 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M1.9032 4.12716C2.64264 3.38772 3.94879 2.61646 6.37318 1.93005C9.32526 1.09932 11.7675 0.615575 15.5249 0.610651C19.1513 0.609514 21.2074 0.900442 24.6906 1.91301C28.6242 3.0555 29.7167 4.62378 30.0194 5.4583C30.3823 6.45458 30.3213 7.3285 30.1205 8.33614C30.0022 8.90417 29.8317 9.46009 29.6114 9.99685C29.5898 10.051 29.5701 10.1018 29.5527 10.1472C29.4496 10.4192 29.2932 10.831 28.7969 11.0545C28.4666 11.2045 28.0677 11.2344 27.4006 11.2386C26.0335 11.2481 23.5811 10.6768 22.4916 10.2813C21.7582 10.0139 21.2737 9.83775 20.9029 9.46765C20.4691 9.03391 20.3528 8.48122 20.2566 7.85543C20.2384 7.73799 20.2229 7.62397 20.2078 7.51336C20.1172 6.84627 20.071 6.67353 19.8339 6.51973C19.3566 6.21138 17.5572 5.67195 15.4889 5.67423C13.4206 5.6765 11.6947 6.22199 11.2163 6.53224C10.9689 6.69247 10.9231 6.87014 10.8307 7.55957C10.8174 7.65844 10.8041 7.76034 10.7882 7.86489C10.6848 8.56911 10.5784 9.10058 10.1549 9.52409L10.1526 9.52636C9.784 9.89495 9.30859 10.0506 8.52218 10.3097C7.49636 10.6476 5.0106 11.2765 3.63854 11.2704C2.97145 11.2678 2.57256 11.2394 2.24224 11.0901C1.74486 10.8655 1.59031 10.4541 1.48462 10.181C1.46719 10.1355 1.44825 10.0855 1.42628 10.0309C1.20785 9.49361 1.03933 8.93731 0.922838 8.36909C0.723205 7.36411 0.664868 6.48981 1.02891 5.49164C1.21319 4.97644 1.51215 4.50987 1.9032 4.12716Z"
                                                        fill="white"
                                                    />
                                                </svg>
                                            </button>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );

    return <AnimatePresence>{DialerContent}</AnimatePresence>;
});

PowerDialerFloating.displayName = 'PowerDialerFloating';

export { PowerDialerFloating };
