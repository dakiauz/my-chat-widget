import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { Outlet } from 'react-router-dom';
import EmailVerification from '../../features/Authentication/components/EmailVerification';

function EmailVerifiedMiddleware() {
    const location = window.location.pathname;
    const auth = useSelector((state: IRootState) => state.auth);
    return <>{auth?.user?.email_verified_at ? <Outlet /> : <EmailVerification />}</>;
}

export default EmailVerifiedMiddleware;
