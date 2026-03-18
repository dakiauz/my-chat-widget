import { IResponse } from '../../../../_theme/modules/sidebar-menu/types';
import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';
import {
    IConversationalChannelsResponse,
    IConversationMessagesResponse,
    IConversationRequest,
    IConversationResponse,
    IConversationsResponse,
    IGetMessageStatusResponse,
    IMarkAsReadResponse,
    ISendMessageRequest,
    ISendMessageResponse,
    IQuickMessageRequest,
} from '../models/conversation';

export const conversationsApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query<IConversationsResponse, void>({
            query: () => ({
                url: `/convsersions/messages`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),

        getConversations: builder.query<IConversationsResponse, void>({
            query: () => ({
                url: '/convsersions/list',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Conversations'],
        }),
        createConversation: builder.mutation<IConversationResponse, IConversationRequest>({
            query: (body) => ({
                url: '/convsersions/create',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Conversations'],
        }),
        getConversationChannels: builder.query<IConversationalChannelsResponse, number>({
            query: (conversationId) => ({
                url: `/convsersions/channels/${conversationId}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Conversations'],
        }),
        createConversationChannel: builder.mutation<IResponse, { conversationId: number; channel: 'SMS' | 'EMAIL' }>({
            query: (formData) => ({
                url: `/convsersions/channel/create`,
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Conversations'],
        }),
        reloadConversation: builder.mutation<IConversationMessagesResponse, number>({
            query: (conversationId) => ({
                url: `/convsersions/${conversationId}/messages`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        readConversation: builder.mutation<IMarkAsReadResponse, number>({
            query: (conversationId) => ({
                url: `/convsersions/${conversationId}/read`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        readChatWidgetConversation: builder.mutation<IMarkAsReadResponse, number>({
            query: (conversationId) => ({
                url: `chat-widget/conversation/${conversationId}/read`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        sendMessage: builder.mutation<ISendMessageResponse, ISendMessageRequest>({
            query: (formData) => ({
                url: `/messages/send`,
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Conversations'],
        }),
        getMessageStatus: builder.mutation<IGetMessageStatusResponse, number>({
            query: (messageId) => ({
                url: `/messages/${messageId}/status`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        resendMessage: builder.mutation<IResponse, number>({
            query: (messageId) => ({
                url: `/messages/${messageId}/resend`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        sendQuickMessage: builder.mutation<IConversationResponse, IQuickMessageRequest>({
            query: (formData) => ({
                url: `/messages/quick/send`,
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Conversations'],
        }),
        toggleAI: builder.mutation<{ success: boolean; ai_enabled: boolean }, number>({
            query: (conversationId) => ({
                url: `/messages/${conversationId}/toggle-ai`,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useCreateConversationMutation,
    useGetConversationChannelsQuery,
    useCreateConversationChannelMutation,
    useGetMessagesQuery,
    useReloadConversationMutation,
    useReadConversationMutation,
    useReadChatWidgetConversationMutation,
    useSendMessageMutation,
    useGetMessageStatusMutation,
    useResendMessageMutation,
    useSendQuickMessageMutation,
    useToggleAIMutation,
} = conversationsApiSlice;

export default conversationsApiSlice;
