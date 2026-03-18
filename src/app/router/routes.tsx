import { ReactNode, lazy } from 'react';
import { Route, RouteObject, createRoutesFromElements } from 'react-router-dom';
import PublicRoutes from './accesslevels/PublicRoutes';
import SubscriberRoutes, { SubscriperAuthenticationRoutes } from './accesslevels/SubscriberRoutes';
import AuthMiddleware from './middlewares/AuthMiddleware';
import EmailVerifiedMiddleware from './middlewares/EmailVerifiedMiddleware';
import PersistantUser from './middlewares/PersistantUser';
import ProtectedRoute from './middlewares/ProtectedRoute';
import SubscriptionMiddleware from './middlewares/SubscriptionMiddleware';

const Layout = lazy(() => import('../features/Layout'));
const WebsiteLayout = lazy(() => import('../features/Layout/WebsiteLayout'));

export interface IRouteType {
    path: string;
    component: ReactNode;
    permission?: string;
    layout: 'default' | 'blank' | 'website';
}

const elementRoutes: RouteObject[] = createRoutesFromElements(
    <>
        {/* Public Routes */}
        {PublicRoutes.map((route, index) => (
            <Route key={index} {...route} element={route.layout === 'default' ? <Layout>{route.component}</Layout> : <> {route.component} </>} />
        ))}

        {/* Ensure Persistence for Subscriber Authentication Routes */}
        <Route element={<PersistantUser />}>
            {SubscriperAuthenticationRoutes.map((route, index) => (
                <Route
                    key={index}
                    {...route}
                    element={route.layout === 'default' ? <Layout>{route.component}</Layout> : route.layout === 'website' ? <WebsiteLayout>{route.component}</WebsiteLayout> : route.component}
                />
            ))}
            <Route element={<EmailVerifiedMiddleware />}>
                <Route element={<SubscriptionMiddleware />}>
                    <Route element={<AuthMiddleware />}>
                        {SubscriberRoutes.map((route, index) => (
                            <Route
                                key={index}
                                {...route}
                                element={
                                    route.layout === 'default' ? (
                                        <Layout>
                                            <ProtectedRoute permission={route.permission}>{route.component}</ProtectedRoute>
                                        </Layout>
                                    ) : route.layout === 'website' ? (
                                        <WebsiteLayout>
                                            <ProtectedRoute permission={route.permission}>{route.component}</ProtectedRoute>
                                        </WebsiteLayout>
                                    ) : (
                                        <ProtectedRoute permission={route.permission}>{route.component}</ProtectedRoute>
                                    )
                                }
                            />
                        ))}
                    </Route>
                </Route>
            </Route>
        </Route>
    </>
);

export { elementRoutes };
