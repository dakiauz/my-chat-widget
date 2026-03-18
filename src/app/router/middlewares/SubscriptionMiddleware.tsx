import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Checkout from '@/app/pages/subscription/Checkout';
import { Outlet } from 'react-router-dom';

function SubscriptionMiddleware() {
    const auth = useSelector((state: IRootState) => state.auth);
    const hasActiveSubscription = auth.user?.company?.subscription?.active;
    const isSuperAdmin = auth.user?.roles?.some((r: any) => r.name === 'Super Admin');
    // Super Admin bypasses subscription gate — they have full access always
    // if (isSuperAdmin || hasActiveSubscription) return <Outlet />;
    // return <Checkout />;

    // TEMPORARILY DISABLED: Allow all users to bypass the subscription gate
    return <Outlet />;
}

export default SubscriptionMiddleware;
