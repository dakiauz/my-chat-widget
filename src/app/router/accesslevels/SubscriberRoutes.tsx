import authenticationRoutes from '../../pages/authentication/route';
import Index from '../../pages/Index';
import IntegrationManagementRoutes from '../../pages/integrationManagement/routes';
import LeadManagementRoutes from '../../pages/leadmanagement/route';
import TaskManagementRoutes from '../../pages/taskmanagement/routes';
import UserManagementRoutes from '../../pages/usermanagement/routes';
import ConversationManagementRoutes from '../../pages/conversation/route';
import subscriptionRoutes from '@/app/pages/subscription/routes';
import { IRouteType } from '../routes';
import AnalyticsRoutes from '../../pages/analytics/routes';
import ChatsRoutes from '../../pages/chatwidget/route';
import ScrapedContentsRoutes from '../../pages/ScrapedContents/routes';
import OnboardingRoutes from '../../pages/onboarding/route';

const SubscriberRoutes: IRouteType[] = [
    ...UserManagementRoutes,
    ...LeadManagementRoutes,
    ...TaskManagementRoutes,
    ...IntegrationManagementRoutes,
    ...ConversationManagementRoutes,
    ...AnalyticsRoutes,
    ...subscriptionRoutes,
    ...ChatsRoutes,
    ...ScrapedContentsRoutes,
    ...OnboardingRoutes,
    {
        path: '/dashboard',
        component: <Index />,
        layout: 'default',
    },
];
export const SubscriperAuthenticationRoutes: IRouteType[] = [...authenticationRoutes];
export default SubscriberRoutes;
