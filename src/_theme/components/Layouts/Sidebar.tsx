//Dependencies
import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IRootState } from '../../../app/store';
import { toggleSidebar } from '../../themeConfigSlice';
//Icons
import { FaCrown } from 'react-icons/fa';
//Components
import SidearHeading from '../../modules/sidebar-menu/SidebarHeading';
import SidebarItem from '../../modules/sidebar-menu/SidebarItem';
import SidebarMultimenu from '../../modules/sidebar-menu/SidebarMultimenu';
import SidebarNav from '../../modules/sidebar-menu/SidebarNav';
import SidebarNavMenu from '../../modules/sidebar-menu/SideBarNavMenu';
import IconLeads from '../Icon/IconLeads';
import IconTasks from '../Icon/IconTasks';
import IconMenuIntegrations from '../Icon/Menu/IconMenuIntegrations';
import path from 'path';
import IconConversations from '../Icon/IconConversations';
import { useGetIntegrationsQuery } from '../../../app/features/Integrations/services/IntegrationApi';
import IconAnalytics from '../Icon/IconAnalytics';
import { hasRole } from '../../../app/shared/utils/utils';
import { IAuthState } from '@/app/features/Authentication/models/auth';
import IconMenuChat from '../Icon/Menu/IconMenuChat';
import IconWorkflow from '../Icon/IconWorkflow';
import IconAISDR from '../Icon/IconAISDR';
import IconAIMarketingAnalytics from '../Icon/IconAIMarketingAnalytics';

const Sidebar: FC = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [location]);

    useEffect(() => {
        const path = location.pathname;

        if (path.startsWith('/calls') || path.startsWith('/chats')) {
            setCurrentMenu('Conversations');
        } else {
            setCurrentMenu('');
        }
    }, [location.pathname]);

    function hasSubscriptionFeature(auth: IAuthState, lookup: string) {
        const features = auth?.user?.company?.subscription?.features || [];
        return features.some((f) => f.lookup === lookup);
    }

    const render = (key: any, value: any) => {
        switch (key) {
            case 'heading':
                return <SidearHeading title={value} />;
            case 'lightHeading':
                return <SidearHeading title={value} light={true} />;
            case 'list':
                return (
                    <ul className="">
                        {value.items.map((item: any, index: number) => {
                            if (!item) return;
                            else
                                return (
                                    <SidebarItem
                                        key={index}
                                        title={item.title}
                                        Icon={item.Icon}
                                        path={item.path}
                                        isActive={location.pathname === item.path}
                                        premium={item.premium}
                                        disabled={item.disabled} // ✅ forward disabled
                                    />
                                );
                        })}
                    </ul>
                );
            case 'dropdown':
                return <SidebarMultimenu currentMenu={currentMenu} toggleMenu={toggleMenu} title={value.title} Icon={value.Icon} items={value.items} />;
            default:
                return null;
        }
    };

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };
    const auth = useSelector((state: IRootState) => state.auth);

    const Leads = hasRole(
        'View Lead List',
        {
            title: 'Leads',
            path: '/leadslist',
            Icon: IconLeads,
            premium: hasSubscriptionFeature(auth, 'View Leads'),
        },
        auth
    );
    const Tasks = hasRole(
        'View Task',
        {
            title: 'Tasks',
            path: '/tasks',
            Icon: IconTasks,
            premium: hasSubscriptionFeature(auth, 'View Tasks'),
        },
        auth
    );

    const Integrations = hasRole(
        '',
        {
            title: 'Integrations',
            path: '/integrations',
            Icon: IconMenuIntegrations,
        },
        auth
    );

    const ChatWidget = hasRole(
        '',
        {
            title: 'Chat Widget',
            path: '/chat-widget', // Assuming a new path for the chat widget
            Icon: IconMenuChat,
        },
        auth
    );

    const Chats = hasRole(
        '',
        {
            title: 'Chats',
            path: '/chats',
        },
        auth
    );

    const Calls = hasRole(
        'View Call',
        {
            title: 'Calls',
            path: '/calls',
            premium: hasSubscriptionFeature(auth, 'View Call'),
        },
        auth
    );

    const Analytics = {
        title: 'Analytics',
        path: '/analytics',
        Icon: IconAnalytics,
        // premium: true,
    };
    const Workflows = {
        title: 'Workflows',
        path: '/workflows',
        Icon: IconWorkflow,
        disabled: true, // 👈 disable this

        // premium: true,
    };
    const AISDR = {
        title: 'AI SDR',
        path: '/ai',
        Icon: IconAISDR,
        disabled: true, // 👈 disable this
        // premium: true,
    };
    const AIMarketingAnalyst = {
        title: 'AI Marketing Analyst',
        path: '/marketing',
        Icon: IconAIMarketingAnalytics,
        disabled: true, // 👈 disable this

        // premium: true,
    };

    //     const LiveChatWidgetScript = hasRole(
    //     '',
    //     {
    // title: 'Live Chat Widget Script',
    // path: '/chat-widget-script', // 👈 new route
    // Icon: IconMenuChat,          // reuse or replace with another icon
    //     },
    //     auth
    // );

    const Onboarding = {
        title: 'Onboarding',
        path: '/onboarding',
        Icon: IconMenuIntegrations,
    };

    const { data: socialsData, isFetching } = useGetIntegrationsQuery();
    const email = React.useMemo(() => socialsData?.socails?.email, [socialsData]);
    const phoneNumber = React.useMemo(() => socialsData?.socails?.twilioPhoneNumber?.phoneNumber, [socialsData]);

    const chatPermission = React.useMemo(() => Boolean((email || phoneNumber) && Chats), [phoneNumber, email, Chats]);
    const callPermission = React.useMemo(() => Boolean(phoneNumber && Calls), [phoneNumber, Calls]);

    const Voicemails = hasRole(
        'Make Call', // Change if there's a specific voicemail permission
        {
            title: 'Voicemail Drops',
            path: '/voicemails',
        },
        auth
    );

    const ConversationDropdown =
        chatPermission || callPermission
            ? {
                dropdown: {
                    title: 'Conversations',
                    Icon: IconConversations,
                    items: [chatPermission ? Chats : null, callPermission ? Calls : null, callPermission ? Voicemails : null].filter(Boolean),
                },
            }
            : null;

    const TopSidebarMenus = [
        [
            // {
            //     lightHeading: 'User Management',
            // },
            // {
            //     list: {
            //         items: [User,Role],
            //     },
            // },

            {
                list: {
                    items: [Leads, Tasks],
                },
            },
            ConversationDropdown,
            {
                list: {
                    items: [Analytics],
                },
            },
            {
                list: {
                    items: [Integrations, ChatWidget, Onboarding, Workflows, AISDR, AIMarketingAnalyst],
                },
            },
        ],
    ];

    const BottomSidebarMenus = [[]];

    return (
        <SidebarNav>
            <SidebarNavMenu>
                <>
                    <div className="w-full">
                        {TopSidebarMenus.map((menu: any, index: number) =>
                            menu.map((item: any, index: number) => {
                                if (!item) return null;
                                const key = Object.keys(item)[0];
                                const value = item[key];
                                return <React.Fragment key={index}>{render(key, value)}</React.Fragment>;
                            })
                        )}
                    </div>
                    <div className="bg-white">
                        {BottomSidebarMenus.map((menu: any, index: number) =>
                            menu.map((item: any, index: number) => {
                                if (!item) return null;
                                const key = Object.keys(item)[0];
                                const value = item[key];
                                return <React.Fragment key={index}>{render(key, value)}</React.Fragment>;
                            })
                        )}
                        <div className="mb-[10vh] flex justify-center items-center">
                            <img className="object-scale-down w-full  flex-none" src="/assets/images/DashboardBottomLogo.png" alt="logo" />
                        </div>
                    </div>
                </>
            </SidebarNavMenu>
        </SidebarNav>
    );
};

export default Sidebar;
