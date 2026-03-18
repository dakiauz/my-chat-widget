import { lazy } from 'react';
import { IRouteType } from '../../router/routes';

const PrivacyPolicy = lazy(() => {
    return import('./PrivacyPolicy');
});

const TermsAndConditions = lazy(() => {
    return import('./TermsAndConditions');
});

const LegalRoutes: IRouteType[] = [
    {
        path: '/policy',
        component: <PrivacyPolicy />,
        layout: 'blank',
        permission: 'View Policy',
    },
    {
        path: '/terms',
        component: <TermsAndConditions />,
        layout: 'blank',
        permission: 'View Terms',
    },
];

export default LegalRoutes;
