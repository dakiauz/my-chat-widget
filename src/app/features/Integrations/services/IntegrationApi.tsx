import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';
import { ISocialsResponse } from '../models/integration';

export const IntegrationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getIntegrations: builder.query<ISocialsResponse, void>({
            query: () => ({
                url: '/users/socials',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Facebook', 'Imap', 'Twilio'],
        }),
    }),
});
export const { useGetIntegrationsQuery } = IntegrationApi;
