import { lazy } from 'react';
import { IRouteType } from '../../router/routes';

const Users = lazy(() => {
    return import('./Users/List');
});

const Roles = lazy(() => {
    return import('./Roles/List');
});

const UserManagementRoutes: IRouteType[] = [
    {
        path: '/users',
        component: <Users />,
        layout: 'default',
        permission: 'View User',
    },
    {
        path: '/roles',
        component: <Roles />,
        layout: 'default',
        permission: 'View Role',
    },
];

export default UserManagementRoutes;
