import { lazy } from 'react';
import { IRouteType } from '../../router/routes';

const View = lazy(() => {
    return import('./View');
});

const IntegrationManagementRoutes: IRouteType[] = [
    {
        path: '/integrations',
        component: <View />,
        layout: 'default',
        permission: '',
    },
];

export default IntegrationManagementRoutes;
