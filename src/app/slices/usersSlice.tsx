import { createSlice } from '@reduxjs/toolkit';
import { IUser } from '../features/User Management/Users/models/user';

interface IAlert {
    variant: 'success' | 'danger' | 'warning' | 'info';
    message: string;
    title: string;
}

interface IUserSlice {
    users: IUser[];
    loading: boolean;
    error: null | string;
    alert: IAlert | null;
}

const initialState: IUserSlice = {
    users: [],
    loading: false,
    error: null,
    alert: null,
};

const usersSlice = createSlice({
    name: 'users',
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

export const { addAlert, removeAlert } = usersSlice.actions;
export default usersSlice;
