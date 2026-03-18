import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';

export const gmailApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        gmailConnect: builder.mutation<{ success: boolean; redirected_url: string }, void>({
            query: () => ({
                url: '/email/gmail/connect',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        gmailDisconnect: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/email/gmail/disconnect',
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Imap'],
        }),
    }),
});

export const { useGmailConnectMutation, useGmailDisconnectMutation } = gmailApiSlice;
