import { baseApi } from '../../../../slices/baseApiSlice';
import { getState } from '../../../../store';
import { IAddLeadStatusRequest, ILeadStatusesResponse, ILeadStatusResponse, IUpdateLeadStatusRequest } from '../models/leadsStatus';

// leadsStatusApi.ts

export const leadsStatusApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLeadStatus: builder.query<ILeadStatusesResponse, number>({
            query: (id) => ({
                url: `/kanban-status/list/${id}`,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['LeadStatus'],
        }),
        addLeadStatus: builder.mutation<ILeadStatusResponse, IAddLeadStatusRequest>({
            query: (payload) => ({
                url: `/kanban-status/create/${payload.leadlist_id}`,
                method: 'POST',
                body: payload.formData,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['LeadStatus'],
        }),

        updateLeadStatus: builder.mutation<ILeadStatusResponse, IUpdateLeadStatusRequest>({
            query: (payload) => ({
                url: `/kanban-status/update/${payload.id}`,
                method: 'PUT',
                body: payload.formData,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['LeadStatus'],
        }),
    }),
});

export const { useGetLeadStatusQuery, useAddLeadStatusMutation, useUpdateLeadStatusMutation } = leadsStatusApi;

export default leadsStatusApi;
