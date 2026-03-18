import { IResponse } from '../../../../_theme/modules/sidebar-menu/types';
import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';
import { IMapConnectRequest, IOutlookConnectResponse } from '../models/imap';

export const imapApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        iMapConnect: builder.mutation<IResponse, IMapConnectRequest>({
            query: (body) => ({
                url: '/auth/email/connect',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Imap'],
        }),
        iMapDisconnect: builder.mutation<IResponse, void>({
            query: () => ({
                url: '/auth/email/disconnect',
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Imap'],
        }),
        outlookConnect: builder.mutation<IOutlookConnectResponse, void>({
            query: (body) => ({
                url: '/auth/outlook/connect',
                method: 'GET',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Imap'],
        }),
    }),
});

export const { useIMapConnectMutation, useIMapDisconnectMutation, useOutlookConnectMutation } = imapApiSlice;

export default imapApiSlice;
