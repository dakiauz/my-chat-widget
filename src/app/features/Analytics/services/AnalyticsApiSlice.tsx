import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';
import IDashboardData from '../AnalyticsPage';

export interface IBulkMessageStats {
    total: number;
    total_sent: number;
    total_failed: number;
    emails_sent: number;
    emails_failed: number;
    sms_sent: number;
    sms_failed: number;
    gmail_sent: number;
    gmail_failed: number;
    outlook_sent: number;
    outlook_failed: number;
    smtp_sent: number;
    smtp_failed: number;
}

export interface IBulkMessageRecord {
    id: number;
    lead_name: string;
    recipient: string;
    channel: string;
    subject: string | null;
    status: string;
    error_message: string | null;
    created_at: string;
}

export interface ITeamPerformanceResponse {
    success: boolean;
    is_aggregated: boolean;
    bulk_stats: IBulkMessageStats;
    recent_bulk: IBulkMessageRecord[];
    campaigns: ICampaignStats[];
}

export interface IBulkMessageStatsResponse {
    success: boolean;
    stats: IBulkMessageStats;
    recent_messages: IBulkMessageRecord[];
}

export interface ICampaignStats {
    id: number;
    name: string;
    batch_size: number;
    interval_hours: number;
    channels: string[];
    status: string;
    stats: {
        total: number;
        sent: number;
        failed: number;
        pending: number;
    };
    recent_messages: IBulkMessageRecord[];
}

export interface ICampaignStatsResponse {
    success: boolean;
    campaigns: ICampaignStats[];
}

export const analyticsApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardData: builder.query<void, void>({
            query: (builder) => ({
                url: '/dashboard',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        getBulkMessageStats: builder.query<IBulkMessageStatsResponse, string | void>({
            query: (userId) => ({
                url: `/leads/bulk/message-stats${userId ? `?user_id=${userId}` : ''}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        getCampaignStats: builder.query<ICampaignStatsResponse, { filter: string; userId?: string }>({
            query: ({ filter = '30d', userId }) => ({
                url: `/campaigns/stats?filter=${filter}${userId ? `&user_id=${userId}` : ''}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        getTeamPerformance: builder.query<ITeamPerformanceResponse, { filter: string; userId?: string }>({
            query: ({ filter = '30d', userId }) => ({
                url: `/dashboard/team-performance?filter=${filter}${userId ? `&user_id=${userId}` : ''}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
    }),
});

export const { useGetDashboardDataQuery, useGetBulkMessageStatsQuery, useGetCampaignStatsQuery, useGetTeamPerformanceQuery } = analyticsApiSlice;
