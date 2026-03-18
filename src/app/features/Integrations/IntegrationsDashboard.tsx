import React, { useEffect, useMemo } from 'react';
import ToggleSwitchButton from './components/ToggleSwitchButton';
import IntegrationSection from './components/IntegrationSection';
import { Box, LoadingOverlay, Select } from '@mantine/core';
import { useGetIntegrationsQuery } from './services/IntegrationApi';

export type IntegrationItem = {
    id: number;
    title: string;
    description: string;
    rating: number;
    reviews: number;
    image?: string;
    fullImage?: string;
    status: string;
    connectPermission?: boolean;
    disconnectPermission?: boolean;
    handleClick: () => void;
};

import metaImage from './assets/meta.png';
import leadConversation from './assets/lead-conversation.png';
import emailIntegration from './assets/email-integration.png';
import hubspotImage from './assets/hubspot.png';
import salesforce from './assets/salesforce.png';
import zapier from './assets/zapier.png';
import calender from './assets/calender.png';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { hasRole } from '../../shared/utils/utils';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/_theme/themeConfigSlice';

function IntegrationsDashboard() {
    const dispatch = useDispatch();
    const filters = [
        { id: 1, name: 'Connect' },
        { id: 2, name: 'Connected' },
        { id: 3, name: 'Coming Soon' },
    ];
    const [activeFilter, setActiveFilter] = React.useState(filters[0].id);

    const handleFilterChange = (filterId: number) => {
        setActiveFilter(filterId);
    };

    const { data: socialsData, isFetching } = useGetIntegrationsQuery();

    const email = useMemo(() => socialsData?.socails?.email?.username, [socialsData]);
    const auth = useSelector((state: IRootState) => state.auth);

    const integrationsItems = useMemo<IntegrationItem[]>(
        () => [
            {
                id: 1,
                title: 'Meta Lead form',
                description: 'Integrate Meta forms for lead generation.',
                rating: 4.5,
                reviews: 87,
                fullImage: metaImage,
                status: socialsData?.socails?.facebook?.fb_page_token ? 'Connected' : 'Connect',
                handleClick: () => {},
                connectPermission: hasRole('Connect Facebook ', true, auth) ?? false,
                disconnectPermission: hasRole('Disconnect Facebook', true, auth) ?? false,
            },
            {
                id: 2,
                title: 'Phone and SMS',
                description: 'Integrate a chat and call system to interact with leads.',
                rating: 4.5,
                reviews: 87,
                fullImage: leadConversation,
                status: socialsData?.socails?.twilio?.friendlyName ? 'Connected' : 'Connect',
                handleClick: () => {},
                connectPermission: hasRole('Create Twilio Sub Account', true, auth) ?? false,
            },
            {
                id: 3,
                title: 'Email Integration',
                description: 'Email Integration with Gmail, Outlook, and others',
                rating: 4.5,
                reviews: 87,
                fullImage: emailIntegration,
                status: email ? 'Connected' : 'Connect',
                handleClick: () => {},
                connectPermission: true,
            },
            {
                id: 4,
                title: 'HubSpot Integration',
                description: 'Sync your leads and contacts with HubSpot CRM.',
                rating: 4.7,
                reviews: 120,
                fullImage: hubspotImage,
                status: 'Coming Soon',
                handleClick: () => {},
            },
            {
                id: 5,
                title: 'Salesforce Integration',
                description: 'Integrate with Salesforce to manage your sales pipeline.',
                rating: 4.8,
                reviews: 95,
                image: salesforce,
                status: 'Coming Soon',
                handleClick: () => {},
            },
            {
                id: 6,
                title: 'Zapier Integration',
                description: 'Automate workflows by connecting with Zapier.',
                rating: 4.6,
                reviews: 110,
                image: zapier,
                status: 'Coming Soon',
                handleClick: () => {},
            },
            {
                id: 7,
                title: 'Calendar Integration',
                description: 'Sync your calendar to manage appointments and events.',
                rating: 4.4,
                reviews: 75,
                image: calender,
                status: 'Coming Soon',
                handleClick: () => {},
            },
        ],
        [socialsData]
    );

    const filteredItems = useMemo(() => {
        switch (activeFilter) {
            case 1:
                return integrationsItems.filter((item) => item.status === 'Connect' || true);
            case 2:
                return integrationsItems.filter((item) => item.status === 'Connected');
            case 3:
                return integrationsItems.filter((item) => item.status === 'Coming Soon');
            default:
                return integrationsItems;
        }
    }, [activeFilter, integrationsItems]);

    useEffect(() => {
        dispatch(setPageTitle('Integrations'));
    });

    return (
        <Box pos={'relative'}>
            <LoadingOverlay visible={isFetching} overlayBlur={2} zIndex={1000} overlayOpacity={0.5} overlayColor={'#fff'} />
            <div className="p-6 flex flex-col gap-6">
                <div>
                    <ToggleSwitchButton
                        items={[
                            { id: 1, name: 'Integrations' },
                            { id: 2, name: 'Extensions' },
                        ]}
                    />
                </div>
                <section>
                    <div className="flex justify-between bg-emerald-50 container rounded-t-lg p-4 py-6">
                        <div className="flex flex-wrap flex-grow gap-4  ">
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    className={` basis-32 flex-shrink px-4 py-2 rounded-lg text-sm font-medium ${activeFilter == filter.id ? 'bg-primary text-white' : 'bg-white text-black-400'}`}
                                    onClick={() => {
                                        handleFilterChange(filter.id);
                                    }}
                                >
                                    {filter.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4  ">
                            <Select
                                data={[{ value: '1', label: 'Most Recent' }]}
                                value={activeFilter.toString()}
                                onChange={(value) => {
                                    handleFilterChange(Number(value));
                                }}
                                placeholder="Select Filter"
                            />
                        </div>
                    </div>
                    <IntegrationSection integrationsItems={filteredItems} />
                </section>
            </div>
        </Box>
    );
}

export default IntegrationsDashboard;
