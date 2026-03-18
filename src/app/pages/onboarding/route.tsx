import { IRouteType } from '../../router/routes';
import OnboardingPage from './OnboardingPage';

const OnboardingRoutes: IRouteType[] = [
    {
        path: '/onboarding',
        component: <OnboardingPage />,
        layout: 'default',
    },
];

export default OnboardingRoutes;
