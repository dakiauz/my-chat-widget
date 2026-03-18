import { IResponse } from '../../../../_theme/modules/sidebar-menu/types';
import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';
import { IFacebookConnectedLeadgenFormsResponse, IFacebookLeadgenFormsResponse, IFacebookLoginResponse, IFacebookPagesResponse } from '../models/facebook';

// Assuming IFacebookFormFieldsResponse is defined elsewhere, this is a placeholder
interface IFacebookFormFieldsResponse {
    data: { name: string; id: string }[];
}

export const facebookApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        facebookLogin: builder.mutation<IFacebookLoginResponse, void>({
            query: () => ({
                url: '/auth/facebook/login',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Facebook'],
        }),

        facebookLogout: builder.mutation<IResponse, void>({
            query: () => ({
                url: '/auth/facebook/logout',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Facebook'],
        }),

        getFacebookPages: builder.query<IFacebookPagesResponse, void>({
            query: () => ({
                url: '/auth/facebook/pages',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        facebookPageConnect: builder.mutation<
            IResponse,
            {
                pageId: string;
                pageAccessToken: string;
            }
        >({
            query: ({ pageId, pageAccessToken }) => ({
                url: `/auth/facebook/page/connect`,
                method: 'POST',
                body: { pageId, pageAccessToken },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Facebook'],
        }),
        getLeadGenForms: builder.query<IFacebookLeadgenFormsResponse, void>({
            query: () => ({
                url: `/facebook/leadgen_forms`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Facebook'],
        }),
        getConnectedLeadGenForms: builder.query<IFacebookConnectedLeadgenFormsResponse, string>({
            query: (leadListId) => ({
                url: `/facebook/${leadListId}/leadgen/get`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Facebook'],
        }),
        storeFacebookLeads: builder.mutation<
            IResponse,
            {
                leadListId: number;
                formId: number; 
                mapping: Record<string, string>; 
            }
        >({
            query: (formData) => ({
                url: `/facebook/leadgen/connect`,
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Leads', 'Facebook'],
        }),
        disconnectLeadGenForm: builder.mutation<IResponse, string>({
            query: (leadGenFormId) => ({
                url: `/facebook/${leadGenFormId}/disconnect`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Facebook'],
        }),
        // New endpoint to get the fields for a specific form
        getFacebookFormFields: builder.query<IFacebookFormFieldsResponse, string>({
            query: (formId) => ({
                url: `/facebook/${formId}/leads`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Facebook'],
        }),
    }),
});

export const {
    useFacebookLoginMutation,
    useFacebookLogoutMutation,
    useGetFacebookPagesQuery,
    useFacebookPageConnectMutation,
    useGetLeadGenFormsQuery,
    useGetConnectedLeadGenFormsQuery,
    useStoreFacebookLeadsMutation,
    useDisconnectLeadGenFormMutation,
    useGetFacebookFormFieldsQuery, 
} = facebookApiSlice;

export default facebookApiSlice;
