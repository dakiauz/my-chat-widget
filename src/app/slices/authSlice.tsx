import { createSlice } from '@reduxjs/toolkit';
import { IAuthState } from '../features/Authentication/models/auth';

const defaultState: IAuthState = {
    token: null,
    user: null,
    error: null,
    loading: false,
    status: 'idle',
    session: undefined,
    permissions: [],
    company: undefined
};

const initialState: IAuthState = defaultState;

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            state.token = null;
            state.user = null;
            state.error = null;
            state.loading = true;
            state.status = 'loading';
        },
        loginSuccess(state, action) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.permissions = action.payload.permissions ?? []; // Store permissions
            state.error = null;
            state.loading = false;
            state.status = 'succeeded';
        },

        rememberLogin(state, action) {
            state.token = action.payload.token;
            state.user = action.payload.user ?? null;
            state.permissions = action.payload.permissions ?? []; // Store permissions
            state.error = null;
            state.loading = true;
            state.status = 'loading';
        },

        loginFailed(state, action) {
            localStorage.removeItem('authToken');
            state.token = null;
            state.user = null;
            state.error = action.payload.message ?? action.payload;
            state.loading = false;
            state.status = 'failed';
        },
        logout(state) {
            localStorage.removeItem('authToken');
            state.token = null;
            state.user = null;
            state.error = null;
            state.loading = false;
            state.status = 'idle';
        },
        createdSubscription(state, action) {
            state.user = {
                ...state.user,
                id: state.user?.id ?? -1,
                company_id: state.user?.company_id ?? -1,
                company: {
                    ...state?.user?.company,
                    id: state?.user?.company?.id ?? -1,
                    name: state?.user?.company?.name ?? '',
                    stripe_id: '00000',
                    email: state?.user?.company?.email ?? '',
                    address: state?.user?.company?.address ?? null,
                    phoneNumber: state?.user?.company?.phoneNumber ?? null,
                    website: state?.user?.company?.website ?? null,
                    created_at: state?.user?.company?.created_at ?? '',
                    updated_at: state?.user?.company?.updated_at ?? '',
                    subscription: state?.user?.company?.subscription ?? null,
                },
            };
            state.error = null;
            state.loading = false;
            state.status = 'idle';
        },
        subscriptionNotFound(state) {
            state.loading = false;
            state.status = 'idle';
        },
    },
});

export const { login, loginSuccess, loginFailed, logout, rememberLogin, createdSubscription, subscriptionNotFound } = authSlice.actions;

export default authSlice;
