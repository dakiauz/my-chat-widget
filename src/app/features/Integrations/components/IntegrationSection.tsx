import React, { useMemo } from 'react';
import IconStar from '../../../../_theme/components/Icon/IconStar';
import { IntegrationItem } from '../IntegrationsDashboard';
import FacebookLogin from '../Socials/FacebookLogin';
import { useGetIntegrationsQuery } from '../services/IntegrationApi';
import ImapLogin from '../Socials/ImapLogin';
import TwillioLogin from './TwillioLogin';

function IntegrationSection({ integrationsItems = [] }: { integrationsItems: IntegrationItem[] }) {
    const { data: socialsData, isFetching } = useGetIntegrationsQuery();
    const email = useMemo(() => socialsData?.socails?.email?.username, [socialsData]);
    const renderLoginButton = (item: IntegrationItem) => {
        switch (item.id) {
            case 1:
                return (
                    <FacebookLogin
                        connected={Boolean(socialsData?.socails?.facebook?.fb_page_token && socialsData?.socails?.facebook?.fb_token)}
                        fbCallback={Boolean(!socialsData?.socails?.facebook?.fb_page_id && socialsData?.socails?.facebook?.fb_token)}
                        loading={isFetching}
                    />
                );
            case 2:
                return <TwillioLogin twillioData={socialsData?.socails?.twilio} />;

            case 3:
                return <ImapLogin connected={Boolean(email)} loading={isFetching} />;
            default:
                return (
                    <button
                        onClick={item.handleClick}
                        className={`bg-gray-200 text-gray-700 px-4 py-2 rounded-lg ${item.status === 'Connect' ? 'bg-primary text-white' : 'font-bold text-black-light/60'}`}
                    >
                        {item.status}
                    </button>
                );
        }
    };
    return (
        <>
            {integrationsItems.length > 0 ? (
                <section className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-b-lg">
                    {integrationsItems.map((item) => {
                        if (item?.connectPermission === false && item?.disconnectPermission === false) return null; // Skip items without permission
                        return (
                            <div key={item.id} className="flex flex-col gap-4 relative">
                                <div className="panel p-0 shadow-none border-2 border-dark-light rounded-lg flex flex-col gap-4 overflow-hidden ">
                                    <img
                                        src={item.fullImage || item.image}
                                        alt="Integration"
                                        className={` ${item.fullImage ? 'scale-105' : 'p-6'} w-full aspect-video object-scale-down mx-auto`}
                                        style={{ opacity: item.status === 'Coming Soon' ? '0.6' : '1' }}
                                    />
                                    {/* <img src={item.image} alt="Integration" className="w-full aspect-video object-scale-down mx-auto mt-4" /> */}
                                </div>
                                <div className="flex flex-wrap xl:flex-nowrap gap-4 items-start justify-between ">
                                    <div className="flex flex-shrink gap-2 flex-col">
                                        <p className="text-base font-semibold">{item.title}</p>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <div className="ml-auto">{renderLoginButton(item)}</div>
                                </div>

                                {/* <div className="flex items-center gap-2">
                                <IconStar className="h-5 w-5 text-warning" fill={true} />
                                <p className="flex items-center gap-1">
                                    <span className="text-ssm font-semibold">{item.rating}</span>
                                    <span className="text-gray-400">({item.reviews})</span>
                                </p>
                            </div> */}
                            </div>
                        );
                    })}
                </section>
            ) : (
                <div className="w-full h-full min-h-[60vh] flex flex-grow items-center justify-center bg-white">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <svg className="w-8" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M20 28.751C19.034 28.751 18.25 27.9687 18.25 27.001V20.001C18.25 19.035 19.034 18.251 20 18.251C20.966 18.251 21.75 19.035 21.75 20.001V27.001C21.75 27.9687 20.966 28.751 20 28.751Z"
                                    fill="#344054"
                                />
                                <path
                                    d="M18.2587 13.001C18.2587 13.967 19.0515 14.751 20.0175 14.751C20.9835 14.751 21.7675 13.967 21.7675 13.001C21.7675 12.035 20.9835 11.251 20.0175 11.251H20C19.034 11.251 18.2587 12.035 18.2587 13.001Z"
                                    fill="#344054"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M20 39.251C9.38622 39.251 0.749969 30.6147 0.749969 20.001C0.749969 9.38723 9.38622 0.750977 20 0.750977C30.6137 0.750977 39.25 9.38723 39.25 20.001C39.25 30.6147 30.6137 39.251 20 39.251ZM20 4.25098C11.3165 4.25098 4.24997 11.3175 4.24997 20.001C4.24997 28.6862 11.3165 35.751 20 35.751C28.6852 35.751 35.75 28.6862 35.75 20.001C35.75 11.3175 28.6852 4.25098 20 4.25098Z"
                                    fill="#344054"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-md font-semibold text-gray-600 dark:text-gray-300">No integrations found</p>
                            <p className="text-ssm text-gray-600/80 dark:text-gray-400">Create a integration to display it here.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default IntegrationSection;
