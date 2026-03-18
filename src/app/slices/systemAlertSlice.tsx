import { createSlice } from '@reduxjs/toolkit';
interface IAlert {
    variant: 'success' | 'danger' | 'warning' | 'info';
    message: string;
    title: string;
}

interface ISystemAlertSlice {
    loading: boolean;
    error: null | string;
    alert: IAlert | null;
}

const initialState: ISystemAlertSlice = {
    loading: false,
    error: null,
    alert: null,
};

const systemAlertSlice = createSlice({
    name: 'systemAlerts',
    initialState,
    reducers: {
        addAlert(
            state,
            action: {
                payload: IAlert;
            }
        ) {
            state.alert = {
                variant: action.payload.variant,
                message: action.payload.message,
                title: action.payload.title,
            };
        },
        removeAlert(state) {
            state.alert = null;
        },
    },
});

export const { addAlert, removeAlert } = systemAlertSlice.actions;
export default systemAlertSlice;
