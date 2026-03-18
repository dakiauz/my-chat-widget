import { lazy } from 'react';
import { IRouteType } from '../../router/routes';
import UpdateSubscription from './UpdateSubscription';
const Subscription = lazy(() => import('./Subscription'));
const Checkout = lazy(() => import('./Checkout'));

const subscriptionRoutes: IRouteType[] = [
    // {
    //     path: '/subscription',
    //     component: <Subscription />,
    //     layout: 'website',
    // },
    {
        path: '/checkout',
        component: <Checkout />,
        layout: 'website',
    },
    {
        path: '/update-subscription',
        component: <UpdateSubscription />,
        layout: 'website',
    },
];

export default subscriptionRoutes;
