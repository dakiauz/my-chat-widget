// src/middleware/userMiddleware.ts

import { Middleware } from '@reduxjs/toolkit';
import authApi from '../../features/Authentication/services/authApi';
import { logout } from '../../slices/authSlice';
import { addAlert } from '../../slices/systemAlertSlice';

const authMiddleware: Middleware = (storeAPI) => (dispatch) => (action) => {
    if (action.type === 'auth/rememberLogin') {
    }

    if (action.type === 'authApi/executeMutation/fulfilled') {
        // const endpointName = action.meta.arg.endpointName;
        // const payload = action.payload;
        // Check if it's a login endpoint and the result is successful
        // if (endpointName === 'login') {
        //     const response = payload;
        //     // console.log('Login Success');
        //     // storeAPI.dispatch(loginSuccess(result.data));
        // }
    }
    const endpointName = action?.meta?.arg?.endpointName;
    if (endpointName) {
        const payload = action.payload;
        if (payload?.message === 'Unauthorized or token expired!') {
            storeAPI.dispatch(
                addAlert({
                    variant: 'warning',
                    message: 'Please Login Again to Continue',
                    title: 'Session Expired! ',
                })
            );
            storeAPI.dispatch(authApi.util.resetApiState());
            storeAPI.dispatch(logout());
        }
    }

    return dispatch(action);
};

export default authMiddleware;
