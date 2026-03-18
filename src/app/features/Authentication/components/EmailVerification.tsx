import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';
import AuthenticationCard from './AuthenticationCard';
import ResendEmailForm from './forms/ResendEmailForm';

function Register() {
     const dispatch = useDispatch();
            useEffect(() => {
                dispatch(setPageTitle('Email Verification'));
            }, []);
    return (
        <div className="min-h-screen  bg-[url('/assets/images/LoginBg.png')] bg-cover bg-center bg-no-repeat">
            <AuthenticationCard title="Verify Email" description="Please verify your email." size="md">
             <ResendEmailForm/>
            </AuthenticationCard>
        </div>
    );
}

export default Register;
