import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../_theme/themeConfigSlice';
import AuthenticationCard from '../../features/Authentication/components/AuthenticationCard';
import ResetPasswordForm from '../../features/Authentication/components/forms/ResetPasswordForm';

function Register() {
     const dispatch = useDispatch();
            useEffect(() => {
                dispatch(setPageTitle('Reset Password'));
            }, []);
    return (
        <div className="min-h-screen  bg-[url('/assets/images/LoginBg.png')] bg-cover bg-center bg-no-repeat">
            <AuthenticationCard title="Reset" description="Please enter to update password to reset" size="md">
                <ResetPasswordForm />
            </AuthenticationCard>
        </div>
    );
}

export default Register;
