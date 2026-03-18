import { IResponse } from '../../../../_theme/modules/sidebar-menu/types';
import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';
import {
    ICampaignsResponse,
    IContactHistoryResponse,
    IContactsResponse,
    IServiceResponse,
    IStartRecordingResponse,
    ITranscribeRecordingResponse,
    IMessagingServiceConnect,
} from '../../Calls/models/calls';
import {
    ITwilioAvailableNumbersRequest,
    ITwilioAvailableNumbersResponse,
    ITwilioBuyNumbersRequest,
    ITwilioCountriesResponse,
    ITwilioPurchasedNumbersResponse,
    ITwilioSubaccountCreateRequest,
} from '../models/twillio';

export const twilioApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createTwilioSubaccount: builder.mutation<IResponse, ITwilioSubaccountCreateRequest>({
            query: (body) => ({
                url: '/auth/twilio/subaccount/create',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Twilio'],
        }),
        getCountries: builder.query<ITwilioCountriesResponse, void>({
            query: () => ({
                url: '/auth/twilio/subaccount/countries',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        getAvailablePhoneNumbers: builder.query<ITwilioAvailableNumbersResponse, ITwilioAvailableNumbersRequest>({
            query: (body) => ({
                url: '/twilio/phone-number/available',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        getPurchasedPhoneNumbers: builder.query<ITwilioPurchasedNumbersResponse, void>({
            query: () => ({
                url: '/twilio/phone-number/list',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Twilio'],
        }),
        bugTwilioPhoneNumber: builder.mutation<IResponse, ITwilioBuyNumbersRequest>({
            query: (body) => ({
                url: '/twilio/phone-number/buy',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Twilio'],
        }),
        assignTwilioPhoneNumber: builder.mutation<IResponse, { phoneNumberId: string; userId: number }>({
            query: ({ phoneNumberId, userId }) => ({
                url: `/twilio/phone-number/${phoneNumberId}/${userId}/assign`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Twilio', 'Users'],
        }),
        deleteTwilioPhoneNumber: builder.mutation<IResponse, { phoneNumberId: string }>({
            query: ({ phoneNumberId }) => ({
                url: `/twilio/phone-number/${phoneNumberId}/delete`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Twilio'],
        }),

        unAssignTwilioPhoneNumber: builder.mutation<IResponse, { phoneNumberId: string }>({
            query: ({ phoneNumberId }) => ({
                url: `/twilio/phone-number/${phoneNumberId}/un-assign`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Twilio', 'Users'],
        }),

        getCallContacts: builder.query<IContactsResponse, void>({
            query: () => ({
                url: '/twilio/callsLog',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Calls'],
        }),

        getCallContactHistory: builder.query<IContactHistoryResponse, string>({
            query: (phoneNumber) => ({
                url: `/twilio/${phoneNumber}/history`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Calls'],
        }),

        startRecording: builder.mutation<IStartRecordingResponse, { callSid: string }>({
            query: ({ callSid }) => ({
                url: `/twilio/${callSid}/start-recording`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),

        deleteCallLog: builder.mutation<IResponse, string>({
            query: (callSid) => ({
                url: `/twilio/${callSid}/delete`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Calls'],
        }),

        stopRecording: builder.mutation<{ recordingSid: string; status: string }, { callSid: string }>({
            query: ({ callSid }) => ({
                url: `/twilio/recording/stop/${callSid}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),

        updateRecordingStatus: builder.mutation<{ success: boolean }, { callSid: string; recordingSid: string; status?: string }>({
            query: ({ callSid, recordingSid, status = 'stop' }) => ({
                url: `/twilio/${callSid}/${recordingSid}/${status}/update-recording`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),

        transcribeRecording: builder.mutation<ITranscribeRecordingResponse, string>({
            query: (recordingSid) => ({
                url: `/twilio/${recordingSid}/transcribe`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Calls'],
        }),

        getTranscriptionById: builder.query<ITranscribeRecordingResponse, string>({
            query: (transcriptionSid) => ({
                url: `/twilio/${transcriptionSid}/transcription`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        getMessagingService: builder.query<IServiceResponse, void>({
            query: () => ({
                url: `/twilio/a2p-10dlc/service/list`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        getServiceCampaigns: builder.query<ICampaignsResponse, string>({
            query: (id) => ({
                url: `/twilio/a2p-10dlc/service/${id}/campaigns`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        connectService: builder.mutation<{ success: boolean; message: string }, IMessagingServiceConnect>({
            query: (body) => ({
                url: `/twilio/a2p-10dlc/service/connect`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
                body,
            }),
        }),
        SubAccountToken: builder.mutation<
            {
                token: string;
                identity: string;
            },
            void
        >({
            query: () => ({
                url: '/twilio/token',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),

        getSubAccountToken: builder.query<
            {
                token: string;
                identity: string;
            },
            void
        >({
            query: () => ({
                url: '/twilio/token',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        // --- Power Dialer Endpoints ---
        startPowerDialer: builder.mutation<{ success: boolean; message: string; queued_count: number }, { lead_list_id: number; voicemail_drop_id?: number | null }>({
            query: (body) => ({
                url: '/power-dialer/start',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        nextPowerDialer: builder.mutation<{ success: boolean; queue_id: number; lead: any }, void>({
            query: () => ({
                url: '/power-dialer/next',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        dispositionPowerDialer: builder.mutation<{ success: boolean; message: string }, { queue_id: number; kanban_status_id?: string | number | null; disposition_status?: string | null }>({
            query: (body) => ({
                url: '/power-dialer/disposition',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Leads', 'LeadStatus'], // Invalidates queries looking for Leads to auto update the Kanban Board
        }),
        checkStatusPowerDialer: builder.query<{ success: boolean; disposition: string | null; status: string }, number>({
            query: (queueId) => ({
                url: `/power-dialer/status/${queueId}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
        enableTranscription: builder.mutation<{ success: boolean; message: string; twilioSubAccount: any }, void>({
            query: () => ({
                url: '/twilio/subaccount/transcription/enable',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Twilio', 'Calls', 'Users'],
        }),
        disableTranscription: builder.mutation<{ success: boolean; message: string; twilioSubAccount: any }, void>({
            query: () => ({
                url: '/twilio/subaccount/transcription/disable',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Twilio', 'Calls', 'Users'],
        }),
    }),
});

export const {
    useCreateTwilioSubaccountMutation,
    useGetCountriesQuery,
    useGetAvailablePhoneNumbersQuery,
    useGetPurchasedPhoneNumbersQuery,
    useBugTwilioPhoneNumberMutation,
    useUnAssignTwilioPhoneNumberMutation,
    useAssignTwilioPhoneNumberMutation,
    useDeleteTwilioPhoneNumberMutation,
    useSubAccountTokenMutation,
    useGetSubAccountTokenQuery,
    useGetCallContactsQuery,
    useGetCallContactHistoryQuery,
    useStartRecordingMutation,
    useUpdateRecordingStatusMutation,
    useTranscribeRecordingMutation,
    useGetTranscriptionByIdQuery,
    useGetMessagingServiceQuery,
    useGetServiceCampaignsQuery,
    useConnectServiceMutation,
    useStartPowerDialerMutation,
    useNextPowerDialerMutation,
    useDispositionPowerDialerMutation,
    useCheckStatusPowerDialerQuery,
    useLazyCheckStatusPowerDialerQuery,
    useEnableTranscriptionMutation,
    useDisableTranscriptionMutation,
    useDeleteCallLogMutation,
} = twilioApiSlice;

export default twilioApiSlice;
