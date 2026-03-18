// leadsApi.ts
import { IImportLeadResponse } from '@/app/slices/leadSlice';
import { baseApi } from '../../../../slices/baseApiSlice';
import { getState } from '../../../../store';
import { IAddLeadPayload, ILeadResponse, ILeadsAssignPayload, ILeadsDeletePayload, ILeadsDeleteResponse, ILeadsResponse, IUpdateLeadPayload } from '../models/lead';

export interface IBulkMessagePayload {
    leadIds: number[];
    sendEmail: boolean;
    sendSms: boolean;
    emailSubject?: string | null;
    emailBody?: string | null;
    smsBody?: string | null;
}

export interface IBulkMessageResponse {
    success: boolean;
    message: string;
    summary?: {
        emails_sent: number;
        emails_failed: number;
        sms_sent: number;
        sms_failed: number;
        skipped_emails: string[];
        skipped_sms: string[];
    };
}

export const leadsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        addLead: builder.mutation<ILeadsResponse, IAddLeadPayload>({
            query: (formData) => ({
                url: '/leads/create',
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Leads'],
        }),

        getLeads: builder.query<ILeadsResponse, number | string | void>({
            query: (id) => ({
                url: `/leads${id ? `/list/${id}` : '/all'}`,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Leads'],
        }),

        getLeadByPhoneNumber: builder.query<ILeadResponse, string>({
            query: (phoneNumber) => ({
                url: `/leads/${phoneNumber}`,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Leads'],
        }),

        updateLead: builder.mutation<ILeadsResponse, IUpdateLeadPayload>({
            query: ({ id, formData }) => ({
                url: `/leads/update/${id}`,
                method: 'PUT',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Leads'],
        }),

        deleteLead: builder.mutation<ILeadsResponse, number>({
            query: (id) => ({
                url: `/leads/delete/${id}`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Leads'],
        }),

        deleteLeads: builder.mutation<ILeadsDeleteResponse, ILeadsDeletePayload>({
            query: (body) => ({
                url: '/leads/bulk/delete',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
                body,
            }),
            invalidatesTags: ['Leads'],
        }),
        assignLeads: builder.mutation<ILeadsDeleteResponse, ILeadsAssignPayload>({
            query: (body) => ({
                url: '/leads/assign',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
                body,
            }),
            invalidatesTags: ['Leads'],
        }),

        importLead: builder.mutation<IImportLeadResponse, FormData>({
            query: (formData) => ({
                url: `/leads/header`,
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Leads'],
        }),
        mappingLeads: builder.mutation<any, any>({
            query: ({ id, formData }) => ({
                url: `/leads/import/${id}`,
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Leads'],
        }),
        bulkMessage: builder.mutation<IBulkMessageResponse, IBulkMessagePayload>({
            query: (body) => ({
                url: '/leads/bulk/message',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
    }),
});

export const {
    useAddLeadMutation,
    useGetLeadsQuery,
    useUpdateLeadMutation,
    useDeleteLeadMutation,
    useDeleteLeadsMutation,
    useImportLeadMutation,
    useGetLeadByPhoneNumberQuery,
    useAssignLeadsMutation,
    useMappingLeadsMutation,
    useBulkMessageMutation,
} = leadsApi;

export default leadsApi;
