import { lazy } from 'react';

import { IRouteType } from '../../router/routes';

import Email from './Email';
import Logout from './Logout';
import SignUp from './SignUp';

const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const ForgetPassword = lazy(() => import('./ForgetPassword'));
const ResetPassword = lazy(() => import('./ResetPassword'));
const ResetPasswordVerification = lazy(() => import('./ResetPasswordVerification'));

const authenticationRoutes: IRouteType[] = [
    {
        path: '/',
        component: <Login />,
        layout: 'website',
    },
    {
        path: '/login',
        component: <Login />,
        layout: 'website',
    },
    {
        path: '/logout',
        component: <Logout />,
        layout: 'website',
    },
    {
        path: '/sign-up',
        component: <SignUp />,
        layout: 'website',
    },
    {
        path: '/forgot-password',
        component: <ForgetPassword />,
        layout: 'website',
    },
    {
        path: '/password-reset/:token',
        component: <ResetPassword />,
        layout: 'blank',
    },
    {
        path: '/email-verify',
        component: <Email />,
        layout: 'blank',
    },
];

export default authenticationRoutes;
