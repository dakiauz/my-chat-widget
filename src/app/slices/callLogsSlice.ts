import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CallLog } from '../features/Calls/types';

interface CallLogsState {
    logs: CallLog[];
    leadId: number | null;
    callLogData: {
        phone: string | null;
        name: string | null;
        email: string | null;
    };
    filter: 'all' | 'missed' | 'outgoing' | 'incoming';
}

const initialState: CallLogsState = {
    logs: [],
    leadId: null,
    callLogData: {
        name: '',
        phone: '',
        email: '',
    },
    filter: 'all',
};

const callLogsSlice = createSlice({
    name: 'callLogs',
    initialState,
    reducers: {
        setLeadData: (state, action: PayloadAction<Partial<CallLogsState['callLogData']>>) => {
            state.callLogData = {
                ...state.callLogData,
                ...action.payload, // merge only updated fields
            };
        },

        clearLeadData: (state) => {
            state.callLogData = {
                name: null,
                phone: null,
                email: null,
            };
        },
        setCallLogs: (state, action: PayloadAction<CallLog[]>) => {
            state.logs = action.payload;
        },
        setLeadId: (state, action) => {
            state.leadId = action.payload;
        },
        clearLeadId: (state) => {
            state.leadId = null;
        },

        addCallLog: (state, action: PayloadAction<Omit<CallLog, 'id' | 'timestamp'>>) => {
            const newLog: CallLog = {
                ...action.payload,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
            };
            state.logs.unshift(newLog);
        },
        setFilter: (state, action: PayloadAction<'all' | 'missed' | 'outgoing' | 'incoming'>) => {
            state.filter = action.payload;
        },
        clearCallLogs: (state) => {
            state.logs = [];
        },
    },
});

export const { addCallLog, setFilter, clearLeadId, clearCallLogs, setCallLogs, setLeadData, clearLeadData, setLeadId } = callLogsSlice.actions;
export default callLogsSlice.reducer;
