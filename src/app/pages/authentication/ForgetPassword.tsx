import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../_theme/themeConfigSlice';
import ForgotPassword from "../../features/Authentication/components/forms/ForgotPassword";

function ForgetPassword() {
     const dispatch = useDispatch();
        useEffect(() => {
            dispatch(setPageTitle('Forgot Password'));
        }, []);
    return (
        <ForgotPassword/>
    );
}

export default ForgetPassword;
