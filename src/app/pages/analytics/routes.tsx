import { lazy } from 'react';
import { IRouteType } from '../../router/routes';
const Analytics = lazy(() => import('./Analytics'));

const AnalyticsRoutes: IRouteType[] = [
    {
        path: '/analytics',
        component: <Analytics />,
        layout: 'default',
        permission: '',
    },
];

export default AnalyticsRoutes;
