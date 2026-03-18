import { lazy } from 'react';
import VerifyEmail from '../../pages/authentication/VerifyEmail';
import { IRouteType } from '../routes';
import LegalRoutes from '../../pages/legal/routes';
const Error404 = lazy(() => {
    return import('../../shared/components/ui/pages/Error404');
});

const PublicRoutes: IRouteType[] = [
    {
        path: '*',
        component: <Error404 />,
        layout: 'blank',
    },
    {
        path: '/auth/verify-email/:id/:hash',
        component: <VerifyEmail />,
        layout: 'blank',
    },
    ...LegalRoutes,
];

export default PublicRoutes;
