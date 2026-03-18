import { baseApi } from '../../../../slices/baseApiSlice';
import { getState } from '../../../../store';

export interface ICampaign {
    id: number;
    company_id: number;
    user_id: number;
    lead_list_id: number;
    name: string;
    description: string | null;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    batch_size: number;
    interval_hours: number;
    channels: string[];
    email_subject: string | null;
    email_body: string | null;
    sms_body: string | null;
    stop_on_reply: boolean;
    next_run_at: string | null;
    created_at: string;
    updated_at: string;
    total_leads?: number;
    sent_leads?: number;
    pending_leads?: number;
    failed_leads?: number;
}

export interface IStartCampaignPayload {
    lead_list_id: number;
    name: string;
    description?: string;
    batch_size: number;
    interval_hours: number;
    channels: string[];
    email_subject?: string | null;
    email_body?: string | null;
    sms_body?: string | null;
    stop_on_reply?: boolean;
    lead_ids?: number[];
}

export interface IUpdateCampaignStatusPayload {
    id: number;
    status: 'active' | 'paused' | 'cancelled';
}

export const campaignApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCampaignForLeadList: builder.query<{ success: boolean; campaign: ICampaign | null }, number>({
            query: (leadListId) => ({
                url: `/campaigns/lead-list/${leadListId}`,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Campaigns'],
        }),
        startCampaign: builder.mutation<{ success: boolean; message: string; campaign: ICampaign }, IStartCampaignPayload>({
            query: (payload) => ({
                url: '/campaigns/start',
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Campaigns'],
        }),
        updateCampaignStatus: builder.mutation<{ success: boolean; message: string; campaign: ICampaign }, IUpdateCampaignStatusPayload>({
            query: ({ id, status }) => ({
                url: `/campaigns/${id}/status`,
                method: 'PATCH',
                body: JSON.stringify({ status }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Campaigns'],
        }),
    }),
});

export const {
    useGetCampaignForLeadListQuery,
    useStartCampaignMutation,
    useUpdateCampaignStatusMutation,
} = campaignApi;
