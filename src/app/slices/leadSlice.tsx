import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IImportLeadResponse {
    success: boolean;
    message: string;
    columns?: string[];
    file_headers: string[];
    invalid_rows?: {
        row: number;
        reason: string;
    }[];
}

interface ILeadsState {
    importFile: File | null;
    importLeadResponse: IImportLeadResponse | null;
    loading: boolean;
}

const initialState: ILeadsState = {
    importFile: null,
    importLeadResponse: null,
    loading: false,
};

const leadsSlice = createSlice({
    name: 'lead',
    initialState,
    reducers: {
        setImportFile: (state, action: PayloadAction<File | null>) => {
            state.importFile = action.payload;
        },
        clearImportFile: (state) => {
            state.importFile = null;
        },
        setImportLeadResponse: (state, action: PayloadAction<IImportLeadResponse>) => {
            state.importLeadResponse = action.payload;
        },
        clearImportLeadResponse: (state) => {
            state.importLeadResponse = null;
        },
    },
});

export const { setImportFile, setImportLeadResponse, clearImportLeadResponse, clearImportFile } = leadsSlice.actions;
export default leadsSlice.reducer;
