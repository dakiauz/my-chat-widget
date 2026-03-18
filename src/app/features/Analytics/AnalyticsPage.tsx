import { Select } from '@mantine/core';
import { Card, CardContent } from '../Calls/components/ui/card';
import { Info, TrendingUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setPageTitle } from '@/_theme/themeConfigSlice';
import BulkMessageStatus from './components/BulkMessageStatus';
import CampaignStatus from './components/CampaignStatus';

const conversionSources = [
    {
        name: 'Chat Widget',
        icon: '/Icon/ChatWidget.png',
        percentage: 23,
        change: 12.8,
        bgColor: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
    },
    {
        name: 'Facebook',
        icon: '/Icon/Facebook.png',
        percentage: 12,
        change: 0.18,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        name: 'CSV',
        icon: '/Icon/Messages.png',
        percentage: 9,
        change: 0.38,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
    },
    {
        name: 'Whatsapp',
        icon: '/Icon/Whatsapp.png',
        percentage: 4,
        change: 0.18,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
    },
    {
        name: 'Google Ads',
        icon: '/Icon/GoogleAds.png',
        percentage: null,
        change: null,
        bgColor: 'bg-sky-100',
        iconColor: 'text-sky-600',
        comingSoon: true,
    },
    {
        name: 'Tik Tok',
        icon: '/Icon/Tiktok.png',
        percentage: null,
        change: null,
        bgColor: 'bg-gray-700',
        iconColor: 'text-white',
        comingSoon: true,
    },
];

const channelMetrics = [
    {
        name: 'SMS',
        icon: '/Icon/messagemini.png',
        count: 8921,
        change: 8,
        bgColor: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        barColor: 'bg-emerald-600',
        progress: 90,
    },
    {
        name: 'Email',
        icon: '/Icon/emailmini.png',
        count: 5102,
        change: 12.8,
        bgColor: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        barColor: 'bg-cyan-600',
        progress: 65,
    },
    {
        name: 'Call',
        icon: '/Icon/callmini.png',
        count: 4290,
        change: 56,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        barColor: 'bg-purple-600',
        progress: 55,
    },
    {
        name: 'Whatsapp',
        icon: '/Icon/whatsappmini.png',
        count: 6789,
        change: 67,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        barColor: 'bg-green-600',
        progress: 75,
    },
];

const callInsights = [
    {
        name: 'Evelyn Hayes',
        time: '10:22 AM',
        date: '12/03/2025',
        message: "Perhaps a summary of the call's key points could be automatically generated.",
        bgColor: 'bg-emerald-50',
    },
    {
        name: 'Arabella Holt',
        time: '11:59 PM',
        date: '11/03/2025',
        message: 'Maybe a feature to highlight action items discussed during the call?',
        bgColor: 'bg-cyan-50',
    },
    {
        name: 'Theodore Vance',
        time: '03:30 PM',
        date: '10/03/2025',
        message: 'Consider integrating sentiment analysis to gauge customer satisfaction.',
        bgColor: 'bg-emerald-50',
    },
    {
        name: 'Sebastian Quinn',
        time: '08:00 AM',
        date: '09/03/2025',
        message: "Yeah, I know what you mean. I've got a ton of emails to go through. I",
        bgColor: 'bg-cyan-50',
    },
];

export default function AnalyticsPage() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Analytics'));
    });
    return (
        <div className="min-h-screen p-10">
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-8 bg-blue rounded"></div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </div>

            <div className="mx-auto space-y-6 bg-white rounded-lg">
                <Card className="border-0 bg-[#F5F9F8]">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-6 bg-[#FFBC99] rounded"></div>
                                <h2 className="text-lg font-semibold text-gray-900">Highest Conversing Source</h2>
                            </div>
                            <Select
                                placeholder="Select range"
                                data={['Last 7 days', 'Last 14 days', 'Last 30 days']}
                                defaultValue="Last 7 days"
                                size="xs"
                                styles={{
                                    input: {
                                        backgroundColor: 'white',
                                        border: '1px solid #d1d5db', // tailwind gray-300
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                    },
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {conversionSources.map((source, index) => (
                                <div key={index} className="text-center">
                                    <div className={`w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-3`}>
                                        <img src={source.icon} alt={source.name} className="w-14 h-14" />
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <span className="text-sm text-gray-600">{source.name}</span>
                                        <div className="w-3.5 h-3.5 bg-gray-400 rounded-full flex items-center justify-center">
                                            <Info className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    </div>
                                    {source.comingSoon ? (
                                        <div className="text-sm text-green-600 font-medium">Coming Soon</div>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-bold text-gray-900 mb-1">{source.percentage}%</div>
                                            <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>{source.change}% this week</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-8 bg-blue rounded"></div>
                                    <h2 className="text-lg font-semibold text-gray-900">Highest Channel</h2>
                                </div>
                                <Select
                                    placeholder="Select range"
                                    data={['Last 7 days', 'Last 14 days', 'Last 30 days']}
                                    defaultValue="Last 7 days"
                                    size="xs"
                                    styles={{
                                        input: {
                                            backgroundColor: 'white',
                                            border: '1px solid #d1d5db', // tailwind gray-300
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                        },
                                    }}
                                />
                            </div>

                            <div className="space-y-6">
                                {channelMetrics.map((channel, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <img src={channel.icon} alt={channel.name} className={`w-10 h-10 ${channel.iconColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm text-gray-600">{channel.name}</span>
                                                        <div className="w-3.5 h-3.5 bg-gray-400 rounded-full flex items-center justify-center">
                                                            <Info className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                                        <TrendingUp className="w-3 h-3" />
                                                        <span>{channel.change}% this week</span>
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900 mb-2">{channel.count.toLocaleString()}</div>
                                                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className={`absolute left-0 top-0 h-full ${channel.barColor} rounded-full`} style={{ width: `${channel.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-8 bg-emerald-500 rounded"></div>
                                    <h2 className="text-lg font-semibold text-gray-900">Call Insight</h2>
                                </div>
                                <Select
                                    placeholder="Select range"
                                    data={['Last 7 days', 'Last 14 days', 'Last 30 days']}
                                    defaultValue="Last 7 days"
                                    size="xs"
                                    styles={{
                                        input: {
                                            backgroundColor: 'white',
                                            border: '1px solid #d1d5db', // tailwind gray-300
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                        },
                                    }}
                                />
                            </div>

                            <div className="space-y-3">
                                {callInsights.map((insight, index) => (
                                    <div key={index} className={`p-4 ${insight.bgColor} rounded-lg`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-semibold text-gray-900">{insight.name}</div>
                                            <div className="text-xs text-gray-500">{insight.date}</div>
                                        </div>
                                        <div className="text-sm text-gray-700 mb-1">{insight.message}</div>
                                        <div className="text-xs text-gray-500">{insight.time}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bulk Message Status Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-4 h-8 bg-indigo-500 rounded"></div>
                        <h2 className="text-lg font-semibold text-gray-900">Manual Bulk Messages</h2>
                    </div>
                    <BulkMessageStatus />
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-4 h-8 bg-[#FFBC99] rounded"></div>
                        <h2 className="text-lg font-semibold text-gray-900">Automated Campaigns</h2>
                    </div>
                    <CampaignStatus />
                </div>
            </div>
        </div>
    );
}
