import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { CallState } from '../features/Calls/types';
import type { ConnectionStatus } from '../features/Calls/hooks/useTwilioDevice';
import { IContact } from '../features/Calls/models/calls';
import { getContactPhoneNumber } from '../features/Calls/components/contacts/ContactList';

export interface CallSession {
    callSid: string;
    contact: IContact | null;
    status: 'incoming' | 'dialing' | 'active' | 'on-hold';
    direction: 'inbound' | 'outbound';
    dialedNumber: string;
    duration: string;
    timer: number;
    isMuted: boolean;
    isOnHold: boolean;
    isMerged: boolean;
    isRecording: null | 'in-progress' | 'paused';
    connection: any;
}

interface DialerState {
    // --- Phase 2: MULTI-CALL STATE ---
    sessions: CallSession[];
    focusedCallSid: string | null;

    // --- Phase 1: LEGACY SINGLE-CALL STATE (To be deprecated) ---
    callState: CallState;
    dialedNumber: string;
    isDialerOpen: boolean;
    callTimer: number;
    connectionStatus: ConnectionStatus;
    isMuted: boolean;
    isOnHold: boolean;
    isSpeakerOn: boolean;
    isRecording: null | 'in-progress' | 'paused';
    showKeypadInCall: boolean;
    lastDialedNumbers: string[];
    incomingConnection: any;
    activeConnection: any;

    // --- Phase 3: POWER DIALER STATE ---
    isPowerDialerWindowOpen: boolean;
    isPowerDialerActive: boolean;
    currentQueueId: number | null;
    powerDialerStats: {
        completed: number;
        total: number;
    };
}

const initialState: DialerState = {
    // --- Phase 2 ---
    sessions: [],
    focusedCallSid: null,

    // --- Phase 1 ---
    callState: {
        isActive: false,
        isIncoming: false,
        isDialing: false,
        duration: '00:00',
        contact: null,
        dialedNumber: '',
    },
    dialedNumber: '',
    isDialerOpen: false,
    callTimer: 0,
    connectionStatus: 'disconnected',
    isMuted: false,
    isOnHold: false,
    isSpeakerOn: false,
    isRecording: null,
    showKeypadInCall: false,
    lastDialedNumbers: [],
    incomingConnection: null,
    activeConnection: null,

    // --- Phase 3 ---
    isPowerDialerWindowOpen: false,
    isPowerDialerActive: false,
    currentQueueId: null,
    powerDialerStats: { completed: 0, total: 0 },
};

// Async thunk for starting a call with delay simulation
export const startCall = createAsyncThunk('dialer/startCall', async ({ contact, dialedNumber }: { contact: IContact; dialedNumber?: string }, { dispatch }) => {
    // Start dialing state
    dispatch(setDialing({ contact, dialedNumber: dialedNumber || getContactPhoneNumber(contact) || '' }));

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Start active call
    dispatch(setActiveCall());

    return { contact, dialedNumber: dialedNumber || getContactPhoneNumber(contact) || '' };
});

const dialerSlice = createSlice({
    name: 'dialer',
    initialState,
    reducers: {
        setNumber: (state, action: PayloadAction<string>) => {
            state.dialedNumber = action.payload;
        },
        addDigit: (state, action: PayloadAction<string>) => {
            // Apply 12 digit limit to both mobile and desktop
            if (state.dialedNumber.length < 15) {
                state.dialedNumber += action.payload;
            }
        },
        removeDigit: (state) => {
            state.dialedNumber = state.dialedNumber.slice(0, -1);
        },
        clearNumber: (state) => {
            state.dialedNumber = '';
        },
        setDialing: (state, action: PayloadAction<{ contact: IContact; dialedNumber: string }>) => {
            state.callState = {
                isActive: false,
                isIncoming: false,
                isDialing: true,
                duration: '00:00',
                contact: action.payload.contact,
                dialedNumber: action.payload.dialedNumber,
            };
        },
        setActiveCall: (state) => {
            state.callState.isDialing = false;
            state.callState.isActive = true;
            state.callTimer = 0;
            state.showKeypadInCall = false; // Hide keypad when call becomes active

            // Add to last dialed numbers if it's an outgoing call
            if (!state.callState.isIncoming && state.callState.dialedNumber) {
                // Add to the beginning and remove duplicates
                state.lastDialedNumbers = [state.callState.dialedNumber, ...state.lastDialedNumbers.filter((num) => num !== state.callState.dialedNumber)].slice(0, 10); // Keep only last 10 numbers
            }
        },
        receiveCall: (state, action: PayloadAction<IContact>) => {
            state.callState = {
                isActive: false,
                isIncoming: true,
                isDialing: false,
                duration: '00:00',
                contact: action.payload,
                dialedNumber: getContactPhoneNumber(action.payload || ''),
            };
            state.isDialerOpen = true; // Auto-open dialer for incoming calls
        },
        answerCall: (state) => {
            state.callState.isIncoming = false;
            state.callState.isActive = true;
            state.callTimer = 0;
            state.showKeypadInCall = false; // Hide keypad when answering call
        },
        endCall: (state) => {
            if (state.sessions.length > 0) return; // Phase 2: Don't globally destroy state if multi-calls remain.
            state.callState = {
                isActive: false,
                isIncoming: false,
                isDialing: false,
                duration: '00:00',
                contact: null,
                dialedNumber: '',
            };
            state.isRecording = null;
            state.callTimer = 0;
            state.isMuted = false;
            state.isOnHold = false;
            state.showKeypadInCall = false;
        },
        updateCallDuration: (state, action: PayloadAction<string>) => {
            state.callState.duration = action.payload;
        },
        incrementTimer: (state) => {
            state.callTimer += 1;
        },
        setDialerOpen: (state, action: PayloadAction<boolean>) => {
            if (!action.payload && state.sessions.length > 0) return; // Ignore forced closes if calls exist
            state.isDialerOpen = action.payload;
        },
        setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
            state.connectionStatus = action.payload;
        },
        setMuted: (state, action: PayloadAction<boolean>) => {
            state.isMuted = action.payload;
        },
        setOnHold: (state, action: PayloadAction<boolean>) => {
            state.isOnHold = action.payload;
        },
        setSpeakerOn: (state, action: PayloadAction<boolean>) => {
            state.isSpeakerOn = action.payload;
        },
        setRecording: (state, action: PayloadAction<null | 'in-progress' | 'paused'>) => {
            state.isRecording = action.payload;
        },
        toggleKeypadInCall: (state) => {
            state.showKeypadInCall = !state.showKeypadInCall;
        },
        setShowKeypadInCall: (state, action: PayloadAction<boolean>) => {
            state.showKeypadInCall = action.payload;
        },
        setIncomingConnection: (state, action: PayloadAction<any>) => {
            state.incomingConnection = action.payload;
        },
        setActiveConnection: (state, action: PayloadAction<any>) => {
            state.activeConnection = action.payload;
        },
        stopRecording: (state) => {
            state.isRecording = null;
        },
        // --- Phase 2: NEW MULTI-CALL REDUCERS ---
        addCallSession: (state, action: PayloadAction<CallSession>) => {
            const existingIndex = state.sessions.findIndex((s) => s.callSid === action.payload.callSid);
            if (existingIndex !== -1) {
                state.sessions[existingIndex] = action.payload; // Update rather than duplicate
            } else {
                state.sessions.push(action.payload);
            }
            if (!state.focusedCallSid) {
                state.focusedCallSid = action.payload.callSid;
            }
        },
        updateCallSession: (state, action: PayloadAction<Partial<CallSession> & { callSid: string }>) => {
            const index = state.sessions.findIndex((s) => s.callSid === action.payload.callSid);
            if (index !== -1) {
                state.sessions[index] = { ...state.sessions[index], ...action.payload };
            }
        },
        removeCallSession: (state, action: PayloadAction<string>) => {
            state.sessions = state.sessions.filter((s) => s.callSid !== action.payload);
            if (state.focusedCallSid === action.payload) {
                state.focusedCallSid = state.sessions.length > 0 ? state.sessions[0].callSid : null;
            }
            if (state.sessions.length === 0) {
                state.isDialerOpen = false;
                state.callState.isActive = false;
                state.callState.isIncoming = false;
                state.callState.isDialing = false;
                state.callState.duration = '00:00';
                state.callState.contact = null;
                state.callState.dialedNumber = '';
                state.isRecording = null;
                state.callTimer = 0;
                state.isMuted = false;
                state.isOnHold = false;
                state.showKeypadInCall = false;
            }
        },
        setFocusedCallSid: (state, action: PayloadAction<string | null>) => {
            state.focusedCallSid = action.payload;
        },

        // --- Phase 3: POWER DIALER REDUCERS ---
        setPowerDialerWindowOpen: (state, action: PayloadAction<boolean>) => {
            state.isPowerDialerWindowOpen = action.payload;
            if (action.payload) {
                state.isDialerOpen = false; // Close regular dialer when opening power dialer
            }
        },
        setPowerDialerActive: (state, action: PayloadAction<boolean>) => {
            state.isPowerDialerActive = action.payload;
            if (!action.payload) {
                state.currentQueueId = null;
            }
        },
        setCurrentQueueId: (state, action: PayloadAction<number | null>) => {
            state.currentQueueId = action.payload;
        },
        setPowerDialerStats: (state, action: PayloadAction<{ completed: number; total: number }>) => {
            state.powerDialerStats = action.payload;
        },
    },
});

export const {
    setNumber,
    addDigit,
    removeDigit,
    clearNumber,
    setDialing,
    setActiveCall,
    receiveCall,
    answerCall,
    endCall,
    updateCallDuration,
    incrementTimer,
    setDialerOpen,
    setConnectionStatus,
    setMuted,
    setOnHold,
    setSpeakerOn,
    stopRecording,
    setRecording,
    toggleKeypadInCall,
    setShowKeypadInCall,
    setIncomingConnection,
    setActiveConnection,
    addCallSession,
    updateCallSession,
    removeCallSession,
    setFocusedCallSid,
    setPowerDialerWindowOpen,
    setPowerDialerActive,
    setCurrentQueueId,
    setPowerDialerStats,
} = dialerSlice.actions;

export default dialerSlice.reducer;
