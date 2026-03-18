// src/services/baseApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import backendApiAddress from '../shared/config/address';

export const baseApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: backendApiAddress }),
    tagTypes: ['Auth', 'Users', 'Roles', 'Leads', 'LeadList', 'LeadStatus', 'Tasks', 'Facebook', 'Imap', 'Conversations', 'Twilio', 'Calls', 'Plans', 'Chat', 'Voicemails', 'Campaigns'],
    endpoints: () => ({}),
});
