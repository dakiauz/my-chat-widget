import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import 'country-flag-icons/react/3x2';

// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// Tailwind css
import './tailwind.css';

// Router
import { RouterProvider } from 'react-router-dom';
import router from './app/router/index';

// Redux
import { Provider, useSelector } from 'react-redux';
import store, { IRootState } from './app/store/index';
const App = React.lazy(() => import('./app/App'));
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    // <React.StrictMode>
    <Provider store={store}>
        {/* <Suspense fallback={<ClearEatsSplashLoader show={false} />}> */}
        <Suspense fallback={<></>}>
            <MantineProvider>
                <NotificationsProvider>
                    <App>
                        <RouterProvider router={router} />
                    </App>
                </NotificationsProvider>
            </MantineProvider>
        </Suspense>
    </Provider>
    // </React.StrictMode>
);
