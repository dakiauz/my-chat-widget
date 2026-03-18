import { IRouteType } from '../../router/routes';
import Index from '../Index';

const LayoutRoutes: IRouteType[] = [
    {
        path: '/dashboard',
        component: <Index />,
        layout: 'default',
    },
];

export default LayoutRoutes;
