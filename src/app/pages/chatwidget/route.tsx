import { lazy } from 'react';
import { IRouteType } from '../../router/routes';
import ChatWidgetScriptPage from '@/app/features/ChatWidgetScript/ChatWidgetScript';
const Chats = lazy(() => import('./Chats'));

const ChatsRoutes: IRouteType[] = [
    
     {
        path: '/chat-widget',
        component: <Chats />,
        layout: 'default',
        permission: '',
    },
     {
        path: '/chat-widget-script',
        component: <ChatWidgetScriptPage />,
        layout: 'default',
        permission: '',
    },
    
    
];

export default ChatsRoutes;
