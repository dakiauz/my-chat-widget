import { lazy } from 'react';
import { IRouteType } from '../../router/routes';

const Leads = lazy(() => {
    return import('./leads/List');
});

const LeadsAdd = lazy(() => {
    return import('./leads/Add');
});

const LeadsEdit = lazy(() => {
    return import('./leads/Edit');
});

const LeadsList = lazy(() => {
    return import('./leadlist/List');
});

const LeadManagementRoutes: IRouteType[] = [
    {
        path: '/leads/:leadListId',
        component: <Leads />,
        layout: 'default',
        permission: 'View Lead',
    },
    {
        path: '/leads/add',
        component: <LeadsAdd />,
        layout: 'default',
        permission: 'Add Lead',
    },
    {
        path: '/leads/edit/:id',
        component: <LeadsEdit />,
        layout: 'default',
        permission: 'Edit Lead',
    },
    {
        path: '/leadslist',
        component: <LeadsList />,
        layout: 'default',
        permission: 'View Lead List',
    },
];

export default LeadManagementRoutes;
