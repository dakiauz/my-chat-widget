import { lazy } from 'react';
import { IRouteType } from '../../router/routes';

const Tasks = lazy(() => {
    return import('./list');
});

const TaskManagementRoutes: IRouteType[] = [
    {
        path: '/tasks',
        component: <Tasks />,
        layout: 'default',
        permission: 'View Task',
    },
];

export default TaskManagementRoutes;
