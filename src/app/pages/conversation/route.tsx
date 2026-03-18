import { lazy } from 'react';
import { IRouteType } from '../../router/routes';

const Conversation = lazy(() => {
    return import('./Chats');
});

const Calls = lazy(() => {
    return import('./Calls');
});

const Voicemails = lazy(() => {
    return import('./Voicemails');
});

const ConversationManagementRoutes: IRouteType[] = [
    {
        path: '/chats',
        component: <Conversation />,
        layout: 'default',
        permission: '',
    },
    {
        path: '/calls',
        component: <Calls />,
        layout: 'default',
        permission: '',
    },
    {
        path: '/voicemails',
        component: <Voicemails />,
        layout: 'default',
        permission: '',
    },
];

export default ConversationManagementRoutes;
