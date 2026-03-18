import { lazy } from 'react';
import { IRouteType } from '../../router/routes';

const Updating_Website = lazy(() => import('./Updating_Website'));

const ScrapedContentsRoutes: IRouteType[] = [
    {
        path: '/scraped-contents/updating-website',
        component: <Updating_Website />,
        layout: 'default',
    },
];

export default ScrapedContentsRoutes;
