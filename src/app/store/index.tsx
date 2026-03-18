import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import themeConfigSlice from '../../_theme/themeConfigSlice';
import { authApi } from '../features/Authentication/services/authApi';
import authSlice from '../slices/authSlice';
import tasksSlice from '../slices/tasksSlice';
import usersSlice from '../slices/usersSlice';
import authMiddleware from './middlewares/authMiddleware';
import dialerReducer from '../slices/dialerSlice';
import callLogsReducer from '../slices/callLogsSlice';
import uiReducer from '../slices/uiSlice';
import leadsReducer from '../slices/leadSlice';

export const getState = () => store.getState();

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    tasks: tasksSlice,
    dialer: dialerReducer,
    callLogs: callLogsReducer,
    ui: uiReducer,
    lead: leadsReducer,
    [authApi.reducerPath]: authApi.reducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ['dialer.callState.contact', 'dialer.incomingConnection', 'dialer.activeConnection'],
            },
        }).concat(authApi.middleware, authMiddleware),
});

setupListeners(store.dispatch);

export type IRootState = ReturnType<typeof rootReducer>;
export type IAppDispatch = typeof store.dispatch;
export default store;
