// src/features/Subscription/services/subscriptionApi.ts
import { createSubscription } from 'react-redux/es/utils/Subscription';
import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<
      {
        success: boolean;
        message: string;
        plans: Array<{
          id: number;
          name: string;
          description: string;
          price: number;
          interval: 'monthly' | 'yearly';
        }>;
      },
      void
    >({
      query: () => ({
        url: '/subscription/plans',
        method: 'GET',
      }),
      providesTags: ['Plans'],
    }),
    createSubscription: builder.mutation({
      query: (data) => ({
        url: '/subscription/create',
        method: 'POST',
        body: data,
        headers: {
          Authorization: `Bearer ${getState().auth.token}`,
        },
      }),
      invalidatesTags: ['Users'],
    }),
    updateSubscription: builder.mutation({
      query: (data) => ({
        url: '/subscription/update',
        method: 'POST',
        body: data,
        headers: {
          Authorization: `Bearer ${getState().auth.token}`,
        },
      }),
      invalidatesTags: ['Users', 'Plans'],
    }),
  }),
});

export const { useGetPlansQuery, useCreateSubscriptionMutation, useUpdateSubscriptionMutation } = subscriptionApi;

export default subscriptionApi;