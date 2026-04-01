import { Badge, Loader, Text, Tooltip } from '@mantine/core';
import { Card, CardContent } from '../../Calls/components/ui/card';
import { useGetBulkMessageStatsQuery } from '../services/AnalyticsApiSlice';
import { Mail, MessageSquare, CheckCircle, XCircle, Send, AlertTriangle } from 'lucide-react';

const channelColors: Record<string, string> = {
    gmail: 'red',
    outlook: 'blue',
    smtp: 'violet',
    sms: 'teal',
};

const channelLabels: Record<string, string> = {
    gmail: 'Gmail',
    outlook: 'Outlook',
    smtp: 'SMTP',
    sms: 'SMS',
};

const statusColors: Record<string, string> = {
    sent: 'green',
    failed: 'red',
    pending: 'yellow',
};

export default function BulkMessageStatus({ userId, overrideData, timeframe = '30d' }: { userId?: string; overrideData?: any; timeframe?: string }) {
    const { data: individualData, isLoading, isError } = useGetBulkMessageStatsQuery({ filter: timeframe, userId }, { skip: !!overrideData });

    const data = overrideData ? {
        success: true,
        stats: overrideData.bulk_stats,
        recent_messages: overrideData.recent_bulk
    } : individualData;

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
                <span>Failed to load bulk message stats</span>
            </div>
        );
    }

    const stats = data.stats || {
        total: 0,
        total_sent: 0,
        total_failed: 0,
        emails_sent: 0,
        emails_failed: 0,
        sms_sent: 0,
        sms_failed: 0,
        gmail_sent: 0,
        gmail_failed: 0,
        outlook_sent: 0,
        outlook_failed: 0,
        smtp_sent: 0,
        smtp_failed: 0
    };
    const recentMessages = data.recent_messages || [];

    const summaryCards = [
        {
            label: 'Total Sent',
            value: Number(stats.total_sent) || 0,
            icon: <Send className="w-5 h-5" />,
            color: 'bg-emerald-100',
            textColor: 'text-emerald-700',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Total Failed',
            value: Number(stats.total_failed) || 0,
            icon: <XCircle className="w-5 h-5" />,
            color: 'bg-red-100',
            textColor: 'text-red-700',
            iconColor: 'text-red-600',
        },
        {
            label: 'Emails Sent',
            value: Number(stats.emails_sent) || 0,
            icon: <Mail className="w-5 h-5" />,
            color: 'bg-blue-100',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-600',
        },
        {
            label: 'SMS Sent',
            value: Number(stats.sms_sent) || 0,
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'bg-teal-100',
            textColor: 'text-teal-700',
            iconColor: 'text-teal-600',
        },
    ];

    const channelBreakdown = [
        { label: 'Gmail', sent: Number(stats.gmail_sent) || 0, failed: Number(stats.gmail_failed) || 0, color: 'bg-red-500' },
        { label: 'Outlook', sent: Number(stats.outlook_sent) || 0, failed: Number(stats.outlook_failed) || 0, color: 'bg-blue-500' },
        { label: 'SMTP', sent: Number(stats.smtp_sent) || 0, failed: Number(stats.smtp_failed) || 0, color: 'bg-violet-500' },
        { label: 'SMS', sent: Number(stats.sms_sent) || 0, failed: Number(stats.sms_failed) || 0, color: 'bg-teal-500' },
    ];

    const totalMessages = Number(stats.total) || 1;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryCards.map((card, idx) => (
                    <Card key={idx} className="border-0 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center ${card.iconColor}`}>{card.icon}</div>
                            </div>
                            <div className={`text-3xl font-bold ${card.textColor} mb-1`}>{card.value}</div>
                            <div className="text-sm text-gray-500">{card.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Channel Breakdown */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-4 h-6 bg-purple-500 rounded"></div>
                        <h3 className="text-md font-semibold text-gray-900">Channel Breakdown</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {channelBreakdown.map((ch, idx) => {
                            const chTotal = ch.sent + ch.failed;
                            const successRate = chTotal > 0 ? Math.round((ch.sent / chTotal) * 100) : 0;
                            return (
                                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-3 h-3 ${ch.color} rounded-full`}></div>
                                        <span className="text-sm font-medium text-gray-700">{ch.label}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Sent</span>
                                            <span className="font-semibold text-green-600">{ch.sent}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Failed</span>
                                            <span className="font-semibold text-red-600">{ch.failed}</span>
                                        </div>
                                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                                            <div className={`absolute left-0 top-0 h-full ${ch.color} rounded-full transition-all`} style={{ width: `${successRate}%` }}></div>
                                        </div>
                                        <div className="text-xs text-gray-400 text-right">{successRate}% success</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Messages Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-4 h-6 bg-cyan-500 rounded"></div>
                        <h3 className="text-md font-semibold text-gray-900">Recent Messages</h3>
                        <span className="text-xs text-gray-400 ml-auto">Latest {recentMessages.length} messages</span>
                    </div>

                    {recentMessages.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No bulk messages sent yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentMessages.map((msg: any) => (
                                        <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-3 font-medium text-gray-800">{msg.lead_name || '—'}</td>
                                            <td className="py-3 px-3 text-gray-600">{msg.recipient}</td>
                                            <td className="py-3 px-3">
                                                <Badge color={channelColors[msg.channel] || 'gray'} variant="light" size="sm">
                                                    {channelLabels[msg.channel] || msg.channel}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-gray-600 max-w-[200px] truncate">{msg.subject || '—'}</td>
                                            <td className="py-3 px-3">
                                                <Tooltip label={msg.error_message || ''} disabled={!msg.error_message} position="top">
                                                    <Badge
                                                        color={statusColors[msg.status] || 'gray'}
                                                        variant="filled"
                                                        size="sm"
                                                        leftSection={
                                                            msg.status === 'sent' ? (
                                                                <CheckCircle className="w-3 h-3" />
                                                            ) : (
                                                                <XCircle className="w-3 h-3" />
                                                            )
                                                        }
                                                    >
                                                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                                                    </Badge>
                                                </Tooltip>
                                            </td>
                                            <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                                                {new Date(msg.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}{' '}
                                                {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
