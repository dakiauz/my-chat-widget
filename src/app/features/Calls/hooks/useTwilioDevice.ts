import { Device, Call } from '@twilio/voice-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import {
    setDialing,
    setActiveCall,
    endCall,
    receiveCall,
    incrementTimer,
    setConnectionStatus,
    setMuted,
    setOnHold,
    setSpeakerOn,
    setRecording,
    setActiveConnection,
    setDialerOpen,
    // --- Phase 2 ---
    addCallSession,
    removeCallSession,
    updateCallSession,
    setFocusedCallSid,
    type CallSession,
} from '../../../slices/dialerSlice';
import { addCallLog } from '../../../slices/callLogsSlice';
import { formatCallDuration } from '../utils/helpers';
import audioManager from '../utils/audio-manager';
import { IRootState } from '../../../store';
import { useGetSubAccountTokenQuery, useStartRecordingMutation, useUpdateRecordingStatusMutation } from '../../Integrations/services/TwillioApiSlice';
import { useGetIntegrationsQuery } from '../../Integrations/services/IntegrationApi';
import { IContact } from '../models/calls';
import { getContactName, getContactNameWithoutFormatting, getContactPhoneNumber } from '../components/contacts/ContactList';
import { getInitials } from '../../../shared/utils/utils';
import { baseApi } from '../../../slices/baseApiSlice';
import { showNotification } from '@mantine/notifications';
import { setIncomingConnection } from '../../../slices/dialerSlice';
// ▶ Singleton store for all Twilio Call objects — shared across all hook instances
import { twilioCallManager } from '../services/TwilioCallManager';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useTwilioDevice = () => {
    const dispatch = useDispatch();
    const store = useStore<IRootState>();
    const [startRecordingMutation] = useStartRecordingMutation();
    const [stopRecordingMutation] = useUpdateRecordingStatusMutation();
    // Token hooks
    const { data: socialsData } = useGetIntegrationsQuery();
    const socialPhoneNumber = useMemo(() => socialsData?.socails?.twilioPhoneNumber?.phoneNumber, [socialsData]);
    const { data: tokenData, isLoading: isTokenLoading, refetch: refetchToken } = useGetSubAccountTokenQuery(undefined, { skip: !socialPhoneNumber });

    // --- Audio enablement ---
    const [audioEnabled, setAudioEnabled] = useState(false);
    const enableAudioAfterInteraction = async () => {
        if (!audioEnabled && audioManager) {
            try {
                await audioManager.enableAudio();
                setAudioEnabled(true);
            } catch { }
        }
    };

    // Track active call state
    const twilioDeviceRef = useRef<Device | null>(null);
    // Dialer States
    const callStateData = useSelector((state: IRootState) => state.dialer.callState);
    const isRecording = useSelector((state: IRootState) => state.dialer.isRecording);

    // Add refs for all state used in async/event handlers
    const callState = useRef(callStateData);
    useEffect(() => {
        callState.current = callStateData;
    }, [callStateData]);

    const { dialedNumber } = useSelector((state: IRootState) => state.dialer);
    const dialedNumberRef = useRef(dialedNumber);
    useEffect(() => {
        dialedNumberRef.current = dialedNumber;
    }, [dialedNumber]);

    const dialerConnectionStatus = useSelector((state: IRootState) => state.dialer.connectionStatus);
    const isMuted = useSelector((state: IRootState) => state.dialer.isMuted);
    const isOnHold = useSelector((state: IRootState) => state.dialer.isOnHold);
    const isSpeakerOn = useSelector((state: IRootState) => state.dialer.isSpeakerOn);
    const showKeypadInCall = useSelector((state: IRootState) => state.dialer.showKeypadInCall);
    const incomingConnection = useSelector((state: IRootState) => state.dialer.incomingConnection);
    const activeConnection = useSelector((state: IRootState) => state.dialer.activeConnection);

    // --- Phase 2: Track Multi-Call state across closures ---
    const sessions = useSelector((state: IRootState) => state.dialer.sessions);
    const sessionsRef = useRef(sessions);
    useEffect(() => {
        sessionsRef.current = sessions;
    }, [sessions]);

    const isMutedRef = useRef(isMuted);
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const isOnHoldRef = useRef(isOnHold);
    useEffect(() => {
        isOnHoldRef.current = isOnHold;
    }, [isOnHold]);

    const isSpeakerOnRef = useRef(isSpeakerOn);
    useEffect(() => {
        isSpeakerOnRef.current = isSpeakerOn;
    }, [isSpeakerOn]);

    // Hook States and refs
    // NOTE: activeConnectionsMap and incomingConnectionRef are NOT useRef here.
    // They live in twilioCallManager (module-level singleton) so ALL hook instances share the same data.
    const activeConnectionRef = useRef<Call | null>(null);
    const autoRejectTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        activeConnectionRef.current = activeConnection;
    }, [activeConnection]);

    //Recording States
    const [recordingStates, setRecordingStates] = useState<{
        recordingSid: string | null;
        callingSid: string | null;
        status: 'paused' | 'in-progress';
    } | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;
    const [tokenInfo, setTokenInfo] = useState<{ token: string; identity: string } | null>(null);
    const timerRef = useRef<number | null>(null);
    const callTimerRef = useRef(0);
    const deviceSetupInProgressRef = useRef(false);
    const lastInitializedTokenRef = useRef<string | null>(null);
    const [twilioDevice, setTwilioDevice] = useState<Device | null>(null);
    const isHandlingEndRef = useRef(false);

    useEffect(() => {
        if (twilioDevice) {
            twilioDeviceRef.current = twilioDevice;
        }
    }, [twilioDevice]);

    // --- Call end cleanup ---
    const handleCallEnd = (conn?: any) => {
        if (!callState.current.isActive || isHandlingEndRef.current) return;
        isHandlingEndRef.current = true;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (audioManager) {
            audioManager.playCallEndSound();
            audioManager.stopDialTone();
            audioManager.stopRingtone();
        }

        if (callState.current.contact) {
            const duration = formatCallDuration(callTimerRef.current);
            const callType = incomingConnection ? 'incoming' : 'outgoing';
            const callStatus = callTimerRef.current > 0 ? 'completed' : 'missed';

            // Only add optimistic log if we have a valid duration or it was actually answered
            // (Reduces "NaN:NaN" and duplicate noise)
            if (callTimerRef.current > 0) {
                dispatch(
                    addCallLog({
                        contactId: getContactPhoneNumber(callState.current.contact),
                        contactName: getContactName(callState.current.contact),
                        contactInitials: getInitials(getContactNameWithoutFormatting(callState.current.contact)),
                        phone: getContactPhoneNumber(callState.current.contact),
                        type: callType,
                        callDuration: duration,
                        status: callStatus,
                        recording: callState.current.contact?.recording || [],
                    })
                );
            }
        }

        dispatch(setActiveConnection(null));
        dispatch(setIncomingConnection(null));
        setRecordingStates(null);
        localStorage.removeItem('activeCallSid');
        localStorage.removeItem('incomingCallSid');
        localStorage.removeItem('twilioCallAnswered');

        dispatch(endCall());

        // Final invalidate to ensure the DB record is synced
        dispatch((baseApi.util.invalidateTags as any)(['Calls']));
    };

    // --- Format phone number ---
    const formatPhoneNumberForDialing = (phoneNumber: string): string => {
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
            return `+1${digitsOnly}`;
        } else if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
            return `+${digitsOnly}`;
        } else if (digitsOnly.startsWith('+')) {
            return digitsOnly;
        } else {
            return `+${digitsOnly}`;
        }
    };

    // --- Cancel listener attached to each incoming call ---
    const attachCancelListener = (call: Call, callSid: string) => {
        call.on('cancel', () => {
            // Ignore cancels if the same call object was already replaced in the map
            const currentCall = twilioCallManager.getCall(callSid);
            if (currentCall !== call) {
                console.log(`[Twilio Debug] Cancel on stale call object for ${callSid}, ignoring (replaced by newer object).`);
                return;
            }
            const latestSessions = store.getState().dialer.sessions;
            const session = latestSessions.find(s => s.callSid === callSid);
            if (session && session.status === 'active') {
                console.log(`[Twilio Debug] Ignored cancel because session ${callSid} is already active!`);
                return;
            }
            console.log(`[Twilio Debug] Incoming call genuinely canceled. CallSid: ${callSid}`);
            dispatch(setIncomingConnection(null));
            dispatch(setActiveConnection(null));
            setRecordingStates(null);
            twilioCallManager.removeCall(callSid);
            // If pending matches this SID, clear it
            if (twilioCallManager.getPendingCall()?.parameters?.CallSid === callSid) {
                twilioCallManager.clearPendingCall();
            }
            dispatch(removeCallSession(callSid));
            if (audioManager) audioManager.stopRingtone();
            dispatch(setDialerOpen(false));
            dispatch((baseApi.util.invalidateTags as any)(['Calls']));
        });
    };

    const initializeDevice = async (token: string) => {
        if (deviceSetupInProgressRef.current) return;
        deviceSetupInProgressRef.current = true;
        try {
            if (twilioDeviceRef.current) {
                try {
                    twilioDeviceRef.current.removeAllListeners();
                    twilioDeviceRef.current.destroy();
                    eventRef.current = false;
                } catch { }
            }
            const twilioDevice = new Device(token);

            twilioDevice.on('incoming', (call: Call) => {
                isHandlingEndRef.current = false;
                const callSid = call.parameters?.CallSid;

                if (!callSid) {
                    console.warn('[Twilio] Incoming call has no CallSid, ignoring.');
                    return;
                }

                // Twilio fires 'incoming' TWICE for the same call (two internal SDK code paths).
                // Twilio KEEPS the FIRST call object and internally CANCELS the SECOND.
                // Strategy: keep the first in the map. Attach a silent cancel to the second.
                // IMPORTANT: We still update pendingCall so ALL hook instances see the latest object.
                if (twilioCallManager.hasCall(callSid)) {
                    console.log(`[DebugIncoming] DUPLICATE for SID=${callSid}. Updating pendingCall, silencing cancel.`);
                    console.log(`[DebugIncoming] pendingCall BEFORE:`, twilioCallManager.getPendingCall()?.parameters?.CallSid ?? 'null');
                    call.on('cancel', () => {
                        console.log(`[DebugIncoming] Ignored cancel on duplicate call object for ${callSid}.`);
                    });
                    // Always update pendingCall to the latest object so all instances share it
                    twilioCallManager.setPendingCall(call);
                    console.log(`[DebugIncoming] pendingCall AFTER:`, twilioCallManager.getPendingCall()?.parameters?.CallSid ?? 'null');
                    return;
                }

                console.log(`[DebugIncoming] NEW call. SID=${callSid}, From=${call.parameters?.From}. Setting pendingCall.`);
                console.log(`[DebugIncoming] pendingCall BEFORE:`, twilioCallManager.getPendingCall()?.parameters?.CallSid ?? 'null');
                console.log('[Twilio] Incoming call received!', call.parameters.From, '| CallSid:', callSid);

                // Store in singleton — available to ALL hook instances immediately
                twilioCallManager.setPendingCall(call);
                console.log(`[DebugIncoming] pendingCall AFTER:`, twilioCallManager.getPendingCall()?.parameters?.CallSid ?? 'null');

                enableAudioAfterInteraction().then(() => {
                    if (audioManager) audioManager.playRingtone();
                });

                const callerNumber = call.parameters?.From || 'Unknown';
                const incomingContact: IContact = {
                    id: callSid,
                    company_id: -1,
                    lead_id: -1,
                    accountSid: call?.parameters?.AccountSid || '',
                    callSid: callSid,
                    status: 'completed',
                    callDuration: null,
                    recordingUrl: null,
                    recordingSid: null,
                    recordingDuration: null,
                    direction: 'INBOUND',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    from: callerNumber,
                    to: socialPhoneNumber || '',
                    lead: null,
                    recording: [],
                };

                dispatch(receiveCall(incomingContact));

                // --- Phase 2: Add into Multi-Call Array ---
                const newSession: CallSession = {
                    callSid: callSid,
                    contact: incomingContact,
                    status: 'incoming',
                    direction: 'inbound',
                    dialedNumber: callerNumber,
                    duration: '00:00',
                    timer: 0,
                    isMuted: false,
                    isOnHold: false,
                    isMerged: false,
                    isRecording: null,
                    connection: null as unknown as any,
                };
                // Register in singleton map
                twilioCallManager.setCall(callSid, call);
                console.log(`[Twilio Debug] Registered callSid ${callSid} in map. Map keys:`, twilioCallManager.getMapKeys());
                dispatch(addCallSession(newSession));
                dispatch(setDialerOpen(true));

                // Attach cancel listener
                attachCancelListener(call, callSid);

                // Auto-focus the new incoming call so Decline/Answer buttons are visible
                const alreadyOnCall = store.getState().dialer.sessions.some(s => s.status === 'active');
                if (alreadyOnCall) {
                    dispatch(setFocusedCallSid(callSid));
                }
            });

            const handleSuccessfulRegistration = () => {
                console.log('The device is ready to receive incoming calls.');
                dispatch(setConnectionStatus('connected'));
                setRetryCount(0);
                setError(null);
                deviceSetupInProgressRef.current = false;
            };

            twilioDevice.on('registered', handleSuccessfulRegistration);

            twilioDevice.on('error', (err: any) => {
                setError('Twilio error: ' + (err?.message || 'Unknown error'));
                if (dialerConnectionStatus !== 'disconnected') dispatch(setConnectionStatus('error'));
            });

            twilioDevice.on('offline', async () => {
                dispatch(setConnectionStatus('disconnected'));
            });

            setTwilioDevice(twilioDevice);

            twilioDevice.register().catch((err: any) => {
                console.error('[Twilio] Failed to register device:', err);
                setError('Failed to register Twilio Device');
                if (dialerConnectionStatus !== 'disconnected') dispatch(setConnectionStatus('error'));
                deviceSetupInProgressRef.current = false;
            });
        } catch (err) {
            setError('Failed to setup Twilio Device. Device is disabled.');
            if (dialerConnectionStatus !== 'disconnected') dispatch(setConnectionStatus('error'));
            deviceSetupInProgressRef.current = false;
        }
    };

    const eventRef = useRef<any>(null);

    useEffect(() => {
        if (activeConnection?.status === 'open' && !isRecording) {
            startRecording();
        }
    }, [activeConnection, isRecording]);

    // --- Outgoing call ---
    const makeCall = async (phoneNumber: string, contact?: IContact | null, isPowerDialer?: boolean, queueId?: number) => {
        isHandlingEndRef.current = false;
        await enableAudioAfterInteraction();
        if (dialerConnectionStatus !== 'connected' || !twilioDeviceRef.current) {
            setError('Device not ready');
            return false;
        }
        try {
            const formattedNumber = formatPhoneNumberForDialing(phoneNumber);
            const callContact =
                contact ||
                ({
                    id: -1,
                    company_id: -1,
                    lead_id: -1,
                    accountSid: '',
                    callSid: '',
                    status: 'completed',
                    callDuration: null,
                    recordingUrl: null,
                    recordingSid: null,
                    recordingDuration: null,
                    direction: 'OUTBOUND',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    from: socialPhoneNumber || '',
                    to: phoneNumber,
                    lead: null,
                    recording: [],
                } as IContact);
            dispatch(setDialing({ contact: callContact, dialedNumber: phoneNumber }));
            if (audioManager) audioManager.playDialTone();
            const params: any = {
                To: formattedNumber,
                From: socialPhoneNumber || ''
            };
            if (isPowerDialer && queueId) {
                params.isPowerDialer = 'true';
                params.queueId = queueId.toString();
            }

            const call = await twilioDeviceRef.current.connect({ params });
            dispatch(setActiveConnection(call));

            call.on('ringing', () => {
                console.log('[Twilio] Call is ringing');
            });

            call.on('accept', () => {
                console.log('[Twilio] Call accepted');
                if (audioManager) audioManager.stopDialTone();
                localStorage.setItem('twilioCallAnswered', 'true');
                dispatch(setActiveCall());
                dispatch(setIncomingConnection(null));

                const callSid = call.parameters?.CallSid || `outbound-${Date.now()}`;
                localStorage.setItem('activeCallSid', callSid);
                localStorage.removeItem('incomingCallSid');

                // Register outbound call in singleton
                twilioCallManager.setCall(callSid, call);

                // Phase 2: add outbound session
                const outboundContact: IContact = {
                    id: callSid,
                    company_id: -1,
                    lead_id: -1,
                    accountSid: '',
                    callSid,
                    status: 'completed',
                    callDuration: null,
                    recordingUrl: null,
                    recordingSid: null,
                    recordingDuration: null,
                    direction: 'OUTBOUND',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    from: socialPhoneNumber || '',
                    to: phoneNumber,
                    lead: null,
                    recording: [],
                };
                const outboundSession: CallSession = {
                    callSid,
                    contact: outboundContact,
                    status: 'active',
                    direction: 'outbound',
                    dialedNumber: phoneNumber,
                    duration: '00:00',
                    timer: 0,
                    isMuted: false,
                    isOnHold: false,
                    isMerged: false,
                    isRecording: null,
                    connection: null as unknown as any,
                };
                dispatch(addCallSession(outboundSession));
                dispatch(setFocusedCallSid(callSid));

                callTimerRef.current = 0;
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = window.setInterval(() => {
                    dispatch(incrementTimer());
                    callTimerRef.current += 1;
                }, 1000);
            });

            call.on('disconnect', () => {
                console.log('[Twilio] Outbound call disconnected');
                const callSid = call.parameters?.CallSid;
                if (callSid) {
                    twilioCallManager.removeCall(callSid);
                    dispatch(removeCallSession(callSid));
                }
                handleCallEnd(call);
            });

            call.on('cancel', () => {
                if (localStorage.getItem('twilioCallAnswered')) return;
                const callSid = call.parameters?.CallSid;
                if (callSid) {
                    twilioCallManager.removeCall(callSid);
                    dispatch(removeCallSession(callSid));
                }
                handleCallEnd();
                if (audioManager) audioManager.stopDialTone();
                localStorage.removeItem('twilioCallAnswered');
                dispatch(setIncomingConnection(null));
                dispatch(setActiveConnection(null));
                setRecordingStates(null);
                localStorage.removeItem('activeCallSid');
                localStorage.removeItem('incomingCallSid');
                dispatch(endCall());
                dispatch((baseApi.util.invalidateTags as any)(['Calls']));
            });

            return true;
        } catch (err) {
            setError('Failed to make call');
            dispatch(endCall());
            if (audioManager) audioManager.stopDialTone();
            return false;
        }
    };

    // --- Hang up specific call ---
    const hangUp = (specificCallSid?: string) => {
        try {
            if (specificCallSid) {
                const callObj = twilioCallManager.getCall(specificCallSid);
                if (callObj) {
                    console.log(`[Twilio] hangUp: disconnecting call from map. SID: ${specificCallSid}`);
                    callObj.disconnect();
                    twilioCallManager.removeCall(specificCallSid);
                } else {
                    console.warn(`[Twilio] hangUp: SID ${specificCallSid} not in map, trying disconnectAll.`);
                    if (twilioDeviceRef.current) twilioDeviceRef.current.disconnectAll();
                }
                dispatch(removeCallSession(specificCallSid));
                handleCallEnd();
            } else {
                // Hang up everything
                if (activeConnectionRef.current) {
                    activeConnectionRef.current.disconnect();
                } else if (twilioCallManager.getPendingCall()) {
                    twilioCallManager.getPendingCall()?.reject();
                } else if (twilioDeviceRef.current) {
                    twilioDeviceRef.current.disconnectAll();
                }
                handleCallEnd();
            }
        } catch (err) {
            setError('Failed to hang up');
            handleCallEnd();
        }
    };

    // --- Answer incoming call ---
    // Answering a second call automatically disconnects any currently active call first.
    const handleAnswerCall = useCallback(async (specificCallSid?: string) => {
        console.log(`\n=== [AnswerCall] START ===`);
        console.log(`[AnswerCall] Requested SID: ${specificCallSid}`);
        console.log(`[AnswerCall] twilioCallManager pendingCall SID: ${twilioCallManager.getPendingCall()?.parameters?.CallSid ?? 'null'}`);
        console.log(`[AnswerCall] twilioCallManager map keys:`, twilioCallManager.getMapKeys());

        // Find the Call object to accept.
        // All lookups go through twilioCallManager — the SINGLETON shared by all hook instances.
        let conn: Call | null = null;

        if (specificCallSid) {
            // [1] Direct map lookup
            conn = twilioCallManager.getCall(specificCallSid) || null;
            console.log(`[AnswerCall] [1] Direct map lookup for ${specificCallSid}: ${conn ? 'FOUND (SID=' + conn.parameters?.CallSid + ')' : 'NOT FOUND'}`);

            // [2] Value scan fallback
            if (!conn) {
                conn = twilioCallManager.findCallBySid(specificCallSid) || null;
                console.log(`[AnswerCall] [2] findCallBySid: ${conn ? 'FOUND (SID=' + conn.parameters?.CallSid + ')' : 'NOT FOUND'}`);
            }

            // [3] pendingCall fallback — reliable because it's set in the SINGLETON incoming handler
            if (!conn) {
                const pending = twilioCallManager.getPendingCall();
                console.warn(`[AnswerCall] [3] Using pendingCall. Its SID: ${pending?.parameters?.CallSid ?? 'null'}`);
                conn = pending;
                if (conn) {
                    console.warn(`[AnswerCall] [3] ⚠️ pendingCall SID (${conn.parameters?.CallSid}) may differ from requested (${specificCallSid})!`);
                }
            }
        } else {
            conn = twilioCallManager.getPendingCall();
            console.log(`[AnswerCall] No specificCallSid — using pendingCall. SID: ${conn?.parameters?.CallSid ?? 'null'}`);
        }

        console.log(`[AnswerCall] Final conn resolved. SID: ${conn?.parameters?.CallSid ?? 'null'}. Match: ${conn?.parameters?.CallSid === specificCallSid}`);

        if (!conn) {
            console.error('[AnswerCall] ❌ No connection found to answer for', specificCallSid);
            console.error('[AnswerCall] map keys:', twilioCallManager.getMapKeys());
            return;
        }

        try {
            // Disconnect ALL currently active calls first (answer-switches-call behavior)
            const activeSessions = store.getState().dialer.sessions.filter(s => s.status === 'active');
            console.log(`[AnswerCall] Active sessions to disconnect: ${activeSessions.map(s => s.callSid).join(', ') || 'none'}`);
            activeSessions.forEach(s => {
                const activeConn = twilioCallManager.getCall(s.callSid);
                if (activeConn) {
                    console.log(`[AnswerCall] Disconnecting active call: ${s.callSid}`);
                    try { activeConn.disconnect(); } catch (e) { console.error('[AnswerCall] disconnect error:', e); }
                } else {
                    console.warn(`[AnswerCall] Active session ${s.callSid} not in map`);
                }
                // Remove from map and Redux immediately — UI must update right away
                twilioCallManager.removeCall(s.callSid);
                dispatch(removeCallSession(s.callSid));
            });
            // Safety-net disconnectAll (only affects accepted calls, NOT pending incoming)
            if (twilioDeviceRef.current) {
                console.log('[AnswerCall] Calling device.disconnectAll()');
                try { twilioDeviceRef.current.disconnectAll(); } catch (e) { console.error('[AnswerCall] disconnectAll error:', e); }
            }

            console.log(`[AnswerCall] ✅ Calling conn.accept(). conn.parameters.CallSid=${conn.parameters?.CallSid}`);
            localStorage.setItem('twilioCallAnswered', 'true');
            conn.accept();

            // Clear pending immediately after accepting
            twilioCallManager.clearPendingCall();
            console.log('[AnswerCall] pendingCall cleared after accept.');

            callTimerRef.current = 0;
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = window.setInterval(() => {
                dispatch(incrementTimer());
                callTimerRef.current += 1;
            }, 1000);

            dispatch(setIncomingConnection(null));

            const callSid = conn.parameters?.CallSid || specificCallSid;
            console.log(`[AnswerCall] Dispatching updateCallSession for callSid: ${callSid}`);
            console.log(`=== [AnswerCall] END ===\n`);

            if (callSid) {
                dispatch(updateCallSession({ callSid, status: 'active' }));
                dispatch(setFocusedCallSid(callSid));

                // Attach disconnect listener for inbound call
                conn.on('disconnect', () => {
                    console.log('[Twilio] Inbound call disconnected');
                    twilioCallManager.removeCall(callSid);
                    dispatch(removeCallSession(callSid));
                    handleCallEnd(conn);
                });
            }

        } catch (err) {
            console.error('[AnswerCall] ❌ Failed to answer call:', err);
            setError('Failed to answer call');
        }
    }, [audioManager, incomingConnection, dispatch, store]);

    // --- Reject incoming call ---
    const rejectCall = useCallback(async (specificCallSid?: string) => {
        let conn: Call | null = null;
        if (specificCallSid) {
            conn = twilioCallManager.getCall(specificCallSid) || twilioCallManager.findCallBySid(specificCallSid) || null;
            // Final fallback
            if (!conn) {
                conn = twilioCallManager.getPendingCall();
            }
        } else {
            conn = twilioCallManager.getPendingCall() || incomingConnection;
        }
        console.log('[Twilio] Rejecting call', conn?.parameters?.CallSid ?? null);

        // Clear auto-reject timer if any
        if (specificCallSid && autoRejectTimers.current.has(specificCallSid)) {
            clearTimeout(autoRejectTimers.current.get(specificCallSid)!);
            autoRejectTimers.current.delete(specificCallSid);
        }

        if (conn) {
            try {
                conn.reject();
                dispatch(setIncomingConnection(null));

                const callSid = conn.parameters?.CallSid || specificCallSid;
                if (callSid) {
                    twilioCallManager.removeCall(callSid);
                    dispatch(removeCallSession(callSid));
                }
                if (twilioCallManager.getPendingCall()?.parameters?.CallSid === callSid) {
                    twilioCallManager.clearPendingCall();
                }
                if (audioManager) audioManager.stopRingtone();
                dispatch(endCall());
            } catch (err) {
                setError('Failed to reject call');
                dispatch(endCall());
            }
        } else {
            dispatch(endCall());
        }
    }, [incomingConnection, dispatch, store]);

    // --- Mute/unmute ---
    const toggleMute = () => {
        const activeSessions = store.getState().dialer.sessions.filter(s => s.status === 'active');
        let call: Call | null = null;
        if (activeSessions.length > 0) {
            call = twilioCallManager.getCall(activeSessions[0].callSid) || null;
        }
        if (!call) call = activeConnectionRef.current || incomingConnection;
        if (call) {
            try {
                const isNowMuted = !isMutedRef.current;
                if (isNowMuted) {
                    call.mute();
                } else {
                    call.mute(false);
                }
                dispatch(setMuted(isNowMuted));
                return isNowMuted;
            } catch (err) {
                return isMutedRef.current;
            }
        }
        return isMutedRef.current;
    };

    // --- Send DTMF ---
    const sendDigits = async (digit: string) => {
        await enableAudioAfterInteraction();
        if (audioManager) audioManager.playDTMF(digit);
        const call = activeConnectionRef.current;
        if (call) {
            try {
                call.sendDigits(digit);
            } catch { }
        }
    };

    // --- Hold/unhold (simulate) ---
    const toggleHold = () => {
        const isNowOnHold = !isOnHoldRef.current;
        dispatch(setOnHold(isNowOnHold));
        return isNowOnHold;
    };

    // --- Toggle speaker (simulate) ---
    const toggleSpeaker = () => {
        const isNowSpeakerOn = !isSpeakerOnRef.current;
        dispatch(setSpeakerOn(isNowSpeakerOn));
        return isNowSpeakerOn;
    };

    // --- Set audio muted state ---
    const setAudioMuted = (muted: boolean) => {
        if (audioManager) audioManager.setMuted(muted);
        dispatch(setMuted(muted));
    };

    // --- Initial device setup on mount ---
    useEffect(() => {
        if (tokenData && tokenData.token) {
            if (lastInitializedTokenRef.current !== tokenData.token) {
                setTokenInfo({ token: tokenData.token, identity: tokenData.identity || 'user-demo' });
                initializeDevice(tokenData.token);
                localStorage.removeItem('twilioCallAnswered');
                dispatch(setIncomingConnection(null));
                dispatch(setActiveConnection(null));
                setRecordingStates(null);
                localStorage.removeItem('activeCallSid');
                localStorage.removeItem('incomingCallSid');
                lastInitializedTokenRef.current = tokenData.token;
            }
        }
    }, [tokenData]);

    // --- Audio enablement on first user interaction ---
    useEffect(() => {
        const handler = () => {
            enableAudioAfterInteraction();
        };
        document.addEventListener('click', handler);
        document.addEventListener('touchstart', handler);
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('click', handler);
            document.removeEventListener('touchstart', handler);
            document.removeEventListener('keydown', handler);
        };
    }, [enableAudioAfterInteraction]);

    // --- Reconnect logic for UI ---
    const canReconnect = useMemo(() => {
        if (!socialPhoneNumber) return false;
        return dialerConnectionStatus === 'disconnected' || dialerConnectionStatus === 'error';
    }, [dialerConnectionStatus, socialPhoneNumber]);

    const reconnect = () => {
        refetchToken()
            .unwrap()
            .then((res) => {
                if (res.token) {
                    initializeDevice(res.token);
                    lastInitializedTokenRef.current = res.token;
                } else {
                    setError('Failed to refresh Twilio token.');
                }
            })
            .catch((err) => {
                setError('Failed to refresh Twilio token: ' + (err?.message || 'Unknown error'));
            });
    };

    const startRecording = useCallback(async () => {
        const focusedSid = store.getState().dialer.focusedCallSid;
        const targetConn = focusedSid ? twilioCallManager.getCall(focusedSid) : activeConnection;
        if (!targetConn) {
            console.warn('[Twilio] No active connection to start recording.');
            return;
        }

        const callSid = targetConn.parameters?.CallSid;
        if (!callSid) {
            console.error('[Twilio] No Call SID found on active connection.');
            return;
        }

        try {
            const response = await startRecordingMutation({ callSid }).unwrap();
            const recordingSid = response.recordingSid;
            setRecordingStates({
                callingSid: callSid,
                recordingSid,
                status: 'in-progress',
            });
            dispatch(setRecording('in-progress'));
            showNotification({
                title: 'Call Recording Started',
                message: `Recording for ${callSid} initiated.`,
                color: 'green',
            });
        } catch (error) {
            console.error('[Twilio Recording] Failed to start recording:', error);
            dispatch(setRecording(null));
            showNotification({
                title: 'Recording Error',
                message: 'Failed to start call recording.',
                color: 'red',
            });
        }
    }, [activeConnection, startRecordingMutation, dispatch, store]);

    // --- Merge incoming call with the current active call (conference) ---
    // Key difference from handleAnswerCall: we do NOT call disconnectAll() or disconnect active calls.
    // Both WebRTC audio streams run simultaneously and mix at the browser level.
    const mergeCall = useCallback((specificCallSid?: string) => {
        console.log(`\n=== [MergeCall] START ===`);
        console.log(`[MergeCall] Requested SID: ${specificCallSid}`);
        console.log(`[MergeCall] pendingCall SID: ${twilioCallManager.getPendingCall()?.parameters?.CallSid ?? 'null'}`);
        console.log(`[MergeCall] map keys:`, twilioCallManager.getMapKeys());

        // Find Call B — same lookup chain as handleAnswerCall
        let conn: Call | null = null;
        if (specificCallSid) {
            conn = twilioCallManager.getCall(specificCallSid)
                || twilioCallManager.findCallBySid(specificCallSid)
                || twilioCallManager.getPendingCall()
                || null;
            if (conn) console.log(`[MergeCall] Found conn SID: ${conn.parameters?.CallSid}`);
        } else {
            conn = twilioCallManager.getPendingCall();
        }

        if (!conn) {
            console.error('[MergeCall] ❌ No incoming call found to merge. Map keys:', twilioCallManager.getMapKeys());
            return;
        }

        try {
            console.log(`[MergeCall] ✅ Accepting Call B WITHOUT disconnecting Call A. SID=${conn.parameters?.CallSid}`);
            localStorage.setItem('twilioCallAnswered', 'true');
            conn.accept();

            // Clear pending ref immediately after accepting
            twilioCallManager.clearPendingCall();

            const callSidB = conn.parameters?.CallSid || specificCallSid;

            // Mark ALL currently active sessions as merged
            const currentSessions = store.getState().dialer.sessions;
            currentSessions
                .filter(s => s.status === 'active')
                .forEach(s => {
                    console.log(`[MergeCall] Marking session ${s.callSid} as merged`);
                    dispatch(updateCallSession({ callSid: s.callSid, isMerged: true }));
                });

            // Mark Call B's session as active + merged
            if (callSidB) {
                dispatch(updateCallSession({ callSid: callSidB, status: 'active', isMerged: true }));
                dispatch(setFocusedCallSid(callSidB));
            }

            dispatch(setIncomingConnection(null));
            console.log(`=== [MergeCall] END ===\n`);
        } catch (err) {
            console.error('[MergeCall] ❌ Failed to merge call:', err);
            setError('Failed to merge call');
        }
    }, [dispatch, store]);

    const stopRecording = () => {
        if (isRecording && recordingStates?.recordingSid && recordingStates?.callingSid) {
            try {
                stopRecordingMutation({
                    callSid: recordingStates.callingSid,
                    recordingSid: recordingStates.recordingSid,
                    status: recordingStates.status === 'in-progress' ? 'paused' : 'in-progress',
                })
                    .unwrap()
                    .then(() => {
                        dispatch(setRecording(recordingStates.status === 'in-progress' ? 'paused' : 'in-progress'));
                        showNotification({
                            title: recordingStates.status === 'in-progress' ? 'Recording Paused' : 'Recording Resumed',
                            message: `Call recording has been ${recordingStates.status === 'in-progress' ? 'paused' : 'resumed'} successfully.`,
                            color: 'green',
                        });
                        setRecordingStates({
                            recordingSid: recordingStates.recordingSid,
                            callingSid: recordingStates.callingSid,
                            status: recordingStates.status === 'in-progress' ? 'paused' : 'in-progress',
                        });
                    })
                    .catch((err) => {
                        console.error('[Twilio] Failed to stop recording', err);
                    });
            } catch (err) {
                console.error('[Twilio] Failed to stop recording', err);
            }
        } else {
            console.warn('[Twilio] stopRecording not available on connection');
        }
    };

    return {
        device: twilioDeviceRef.current,
        deviceReady: dialerConnectionStatus === 'connected',
        connection: activeConnection,
        incomingConnection,
        error,
        connectionStatus: dialerConnectionStatus,
        isRefreshingToken,
        makeCall,
        answerCall: handleAnswerCall,
        mergeCall,
        rejectCall,
        hangUp,
        toggleMute,
        toggleHold,
        toggleSpeaker,
        sendDigits,
        setAudioMuted,
        audioEnabled,
        tokenInfo,
        isMuted,
        isOnHold,
        isSpeakerOn,
        showKeypadInCall,
        canReconnect,
        reconnect,
        isTokenLoading,
        startRecording,
        stopRecording,
    };
};
