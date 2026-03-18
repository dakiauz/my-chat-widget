import { useState } from 'react';
import { Badge, Loader, Tooltip, Divider, Select, Collapse, ActionIcon } from '@mantine/core';
import { Card, CardContent } from '../../Calls/components/ui/card';
import { useGetCampaignStatsQuery, ICampaignStats } from '../services/AnalyticsApiSlice';
import { CheckCircle, XCircle, Megaphone, AlertTriangle, Send, ChevronDown, ChevronUp, Activity, History } from 'lucide-react';

const channelColors: Record<string, string> = {
    email: 'blue',
    sms: 'teal',
};

const channelLabels: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
};

const statusColors: Record<string, string> = {
    sent: 'green',
    failed: 'red',
    pending: 'yellow',
    active: 'green',
    paused: 'yellow',
    cancelled: 'red',
    completed: 'blue',
};

const calculateTimeLeft = (pending: number, batchSize: number, intervalMinutes: number) => {
    if (pending === 0 || !batchSize || !intervalMinutes) return '0 Minutes';

    const timePerLead = intervalMinutes / Math.max(1, batchSize);
    const totalMinutesLeft = Math.ceil(pending * timePerLead);

    if (totalMinutesLeft >= 1440) return `${Math.floor(totalMinutesLeft / 1440)} Days, ${Math.floor((totalMinutesLeft % 1440) / 60)} Hours`;
    if (totalMinutesLeft >= 60) return `${Math.floor(totalMinutesLeft / 60)} Hours, ${totalMinutesLeft % 60} Minutes`;
    return `${totalMinutesLeft} Minutes`;
};

export default function CampaignStatus() {
    const [filter, setFilter] = useState<string>('30d');
    const [showPrevious, setShowPrevious] = useState(false);
    const { data, isLoading, isError } = useGetCampaignStatsQuery(filter, { pollingInterval: 5000 });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader size="md" />
            </div>
        );
    }

    if (isError || !data?.success) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>Failed to load campaign stats</span>
            </div>
        );
    }

    const campaigns = data.campaigns || [];

    // Split campaigns based on status
    const activeCampaigns = campaigns.filter(c => ['active', 'paused'].includes(c.status));
    const previousCampaigns = campaigns.filter(c => ['completed', 'cancelled'].includes(c.status));

    // Reusable render block to avoid duplicating 100+ lines of JSX
    const renderCampaignCard = (campaign: ICampaignStats) => (
        <Card key={campaign.id} className="border-0 shadow-sm overflow-hidden mb-8">
            <CardContent className="p-0">
                <div className="bg-gray-50 border-b border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h3>
                            <div className="flex gap-2">
                                <Badge color={statusColors[campaign.status] || 'gray'} variant="filled">
                                    {campaign.status.toUpperCase()}
                                </Badge>
                                {campaign.channels.map((ch) => (
                                    <Badge key={ch} color={channelColors[ch] || 'gray'} variant="outline">
                                        {channelLabels[ch] || ch.toUpperCase()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                                {Math.round(((campaign.stats.sent + campaign.stats.failed) / (campaign.stats.total || 1)) * 100)}%
                            </div>
                            <div className="text-sm text-gray-500">Completion Rate</div>
                            {['active', 'paused'].includes(campaign.status) && campaign.stats.pending > 0 && (
                                <div className="text-sm text-blue-600 mt-2 font-medium flex items-center justify-end gap-1">
                                    ⏳ ~{calculateTimeLeft(campaign.stats.pending, campaign.batch_size, campaign.interval_hours)} left
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-sm font-medium text-gray-500 mb-1">Total Leads</div>
                            <div className="text-2xl font-bold text-gray-900">{campaign.stats.total}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-sm font-medium text-emerald-600 mb-1">Delivered</div>
                            <div className="text-2xl font-bold text-emerald-700">{campaign.stats.sent}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-sm font-medium text-yellow-600 mb-1">Pending</div>
                            <div className="text-2xl font-bold text-yellow-700">{campaign.stats.pending}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-sm font-medium text-red-600 mb-1">Failed</div>
                            <div className="text-2xl font-bold text-red-700">{campaign.stats.failed}</div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                        <Send className="w-4 h-4 text-gray-400" />
                        Recent Message Dispatch Log
                    </h4>

                    {campaign.recent_messages.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                            No messages dispatched yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaign.recent_messages.map((msg) => (
                                        <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-2 px-3 font-medium text-gray-800">{msg.lead_name || '—'}</td>
                                            <td className="py-2 px-3 text-gray-600">{msg.recipient}</td>
                                            <td className="py-2 px-3">
                                                <div className="flex gap-1">
                                                    {msg.channel.split(', ').map(ch => (
                                                        <Badge key={ch} color={channelColors[ch] || 'gray'} variant="light" size="xs">
                                                            {channelLabels[ch] || ch.toUpperCase()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-2 px-3">
                                                <Tooltip label={msg.error_message || ''} disabled={!msg.error_message} position="top">
                                                    <Badge
                                                        color={statusColors[msg.status] || 'gray'}
                                                        variant="dot"
                                                        size="sm"
                                                    >
                                                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                                                    </Badge>
                                                </Tooltip>
                                            </td>
                                            <td className="py-2 px-3 text-gray-500 text-xs">
                                                {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                                    hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="mt-4">

            {/* ACTIVE CAMPAIGNS SECTION */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        Active Campaigns
                    </h3>
                </div>
                {activeCampaigns.length === 0 ? (
                    <Card className="border border-dashed shadow-none text-center py-8 text-gray-400 bg-gray-50/50">
                        <Megaphone className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No active campaigns right now</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {activeCampaigns.map(renderCampaignCard)}
                    </div>
                )}
            </div>

            {/* PREVIOUS CAMPAIGNS SECTION */}
            <div className="pt-8 border-t border-gray-100 mt-12 mb-10">
                <div className="flex flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow">
                    <button
                        onClick={() => setShowPrevious(!showPrevious)}
                        className="flex items-center gap-3 text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors w-full cursor-pointer text-left focus:outline-none"
                    >
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <History className="w-5 h-5" />
                        </div>
                        Previous Campaigns
                        {showPrevious ? <ChevronUp className="w-5 h-5 text-gray-400 ml-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 ml-1" />}
                    </button>

                    {showPrevious && (
                        <Select
                            size="sm"
                            className="w-40"
                            placeholder="Filter by time"
                            value={filter}
                            onChange={(val) => setFilter(val || '30d')}
                            data={[
                                { value: '1h', label: 'Last Hour' },
                                { value: '24h', label: 'Last 24 Hours' },
                                { value: '30d', label: 'Last 30 Days' },
                            ]}
                        />
                    )}
                </div>

                <Collapse in={showPrevious}>
                    <div className="px-1">
                        {previousCampaigns.length === 0 ? (
                            <Card className="border border-dashed shadow-none text-center py-8 text-gray-400 bg-gray-50/50">
                                <Megaphone className="w-6 h-6 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No previous campaigns found in this timeframe</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {previousCampaigns.map(renderCampaignCard)}
                            </div>
                        )}
                    </div>
                </Collapse>
            </div>

        </div>
    );
}
