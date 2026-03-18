import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../_theme/themeConfigSlice';
import AuthenticationCard from '../../features/Authentication/components/AuthenticationCard';
import VerifyEmailForm from '../../features/Authentication/components/forms/VerifyEmailForm';

function VerifyEmail() {
     const dispatch = useDispatch();
            useEffect(() => {
                dispatch(setPageTitle('Verify Email'));
            }, []);
    return (
        <div className="min-h-screen  bg-[url('/assets/images/LoginBg.png')] bg-cover bg-center bg-no-repeat">
            <AuthenticationCard title="Verifying Email" description="Please wait while we verify your email" size="md">
                <VerifyEmailForm />
            </AuthenticationCard>
        </div>
    );
}

export default VerifyEmail;
