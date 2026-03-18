import { baseApi } from '../../../../slices/baseApiSlice';
import { getState } from '../../../../store';
import { IAddLeadListRequest, ILeadListResponse, ILeadListsResponse, IUpdateLeadListRequest } from '../models/leadsList';

// leadsListApi.ts

export const leadsListApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLeadsList: builder.query<ILeadListsResponse, void>({
            query: () => ({
                url: '/lead-list/list',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['LeadList'],
        }),
        addLeadList: builder.mutation<ILeadListResponse, IAddLeadListRequest>({
            query: (payload) => ({
                url: '/lead-list/create',
                method: 'POST',
                body: payload,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['LeadList'],
        }),
        updateLeadList: builder.mutation<ILeadListResponse, IUpdateLeadListRequest>({
            query: (payload) => ({
                url: `/lead-list/update/${payload.id}`,
                method: 'PUT',
                body: payload.formData,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['LeadList'],
        }),
        deleteLeadList: builder.mutation<void, number>({
            query: (id) => ({
                url: `/lead-list/delete/${id}`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['LeadList'],
        }),
    }),
});

export const { useGetLeadsListQuery, useAddLeadListMutation, useUpdateLeadListMutation, useDeleteLeadListMutation } = leadsListApi;

export default leadsListApi;
