import IntegrationsDashboard from '../../features/Integrations/IntegrationsDashboard';
import { useEffect, useMemo } from 'react';
import { showNotification } from '@mantine/notifications';
import { useGetIntegrationsQuery } from '@/app/features/Integrations/services/IntegrationApi';

export default function View() {
    const { data: socialsData, isLoading } = useGetIntegrationsQuery();
    const email = useMemo(() => socialsData?.socails?.email, [socialsData]);

    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    const success = params.get('success');
    const message = params.get('message');

    useEffect(() => {
        if (isLoading) return;

        const connected = localStorage.getItem('connect');

        if (!connected || connected !== platform) return;

        if (success === 'true' && email) {
            showNotification({
                title: 'Success',
                message: `${platform} email connected successfully!`,
                color: 'green',
            });
        } else if (success === 'false') {
            showNotification({
                title: 'Failed',
                message: message ?? `${platform} connection failed. Please try again.`,
                color: 'red',
            });
        }

        localStorage.removeItem('connect');

        window.history.replaceState({}, '', window.location.pathname);
    }, [isLoading]);

    return <IntegrationsDashboard />;
}
