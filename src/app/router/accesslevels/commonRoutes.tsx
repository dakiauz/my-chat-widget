import { lazy } from 'react';
import { IRouteType } from '../routes';
const Index = lazy(() => {
    return import('../../pages/Index');
});

const CommonRoutes: IRouteType[] = [];

export default CommonRoutes;
