import React from 'react';
import SplashCompanyLogo from '../../features/Layout/DefaultSplashScreen/components/SplashCompanyLogo';
import AuthenticationCard from '../../features/Authentication/components/AuthenticationCard';
// import RegisterForm from '../../features/Authentication/components/forms/RegisterForm';

function Register() {
    return (
        <>
            <SplashCompanyLogo />
            <AuthenticationCard title="Register Account" description="Please enter in all the fields to continue" size="lg">
                <>REGISTER</>
            </AuthenticationCard>
        </>
    );
}

export default Register;
