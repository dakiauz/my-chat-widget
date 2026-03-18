import { baseApi } from '../../../slices/baseApiSlice';
import { IAuthResponse, IEmailVerificationPayload, IEmailVerificationResponse, ILoginPayload, IRegisterPayload, IResetLinkPayload, IResetPasswordPayload } from '../models/auth';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<IAuthResponse, ILoginPayload>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),

        register: builder.mutation<IAuthResponse, IRegisterPayload>({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Auth'],
        }),

        getUser: builder.mutation<IAuthResponse, string>({
            query: () => ({
                method: 'GET',
                url: '/user',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            }),
        }),

        getUserByToken: builder.query<IAuthResponse, void>({
            query: () => ({
                method: 'GET',
                url: '/user',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            }),
            providesTags: ['Users', 'Plans'],
        }),

        resetPassword: builder.mutation<void, IResetPasswordPayload>({
            query: (data) => ({
                url: '/auth/password-reset',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),

        getResetLink: builder.mutation<void, IResetLinkPayload>({
            query: (data) => ({
                url: `/auth/password-reset/reset-link?email=${encodeURIComponent(data.email)}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),

        resendVerificationEmail: builder.mutation<
            {
                success: boolean;
                message: string;
            },
            void
        >({
            query: () => {
                return {
                    url: '/auth/verify-email/resend',
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                };
            },
            invalidatesTags: ['Auth'],
        }),

        verifyEmail: builder.query<IEmailVerificationResponse, IEmailVerificationPayload>({
            query: ({ id, hash }) => ({
                url: `/auth/verify-email/${id}/${hash}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            }),
            invalidatesTags: ['Auth'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetUserMutation,
    useGetUserByTokenQuery,
    useResetPasswordMutation,
    useGetResetLinkMutation,
    useResendVerificationEmailMutation,
    useVerifyEmailQuery,
    useLogoutMutation,
} = authApi;

export default authApi;
