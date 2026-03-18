import { ILead } from '../../LeadManagement/Leads/models/lead';

export interface IConversation {
    id: number;
    company_id: number;
    user_id: number;
    lead_id: number;
    name: string | null;
    read: number;
    created_at: string;
    updated_at: string;
}

export type ICallDirection = 'INBOUND' | 'OUTBOUND';

export interface IContact {
    id: string | number;
    company_id: number;
    lead_id: number | null;
    accountSid: string;
    callSid: string;
    from: string;
    to: string;
    status: 'no-answer' | 'busy' | 'completed' | 'failed' | 'in-progress' | 'queued' | 'canceled' | 'missed';
    callDuration: string | null;
    recordingUrl: string | null;
    recordingSid: string | null;
    recordingDuration: string | null;
    direction: ICallDirection;
    created_at: string;
    updated_at: string;
    lead: (ILead & { conversation?: IConversation[] }) | null;
    recording: ICallLogRecording[];
    total_calls_count?: number;
    missed_calls_count?: number;
}

export interface ICallLogRecording {
    id: number;
    callSid: string;
    recordingSid: string;
    recordingUrl: string;
    recordingDuration: string;
    recordingStatus: 'completed' | 'processing' | 'failed';
    created_at: string;
    updated_at: string;
    transcript: {
        recordingSid: string;
        transcriptSid: string;
    } | null;
}

export interface IContactsResponse {
    success: boolean;
    contacts: IContact[];
}

export interface IContactHistoryResponse {
    success: boolean;
    history: IContact[];
}

export interface IStartRecordingResponse {
    message: string;
    recordingSid: string;
    status: string;
}

export interface ITranscribeRecordingResponse {
    success: boolean;
    message: string;
    transcription: ITranscription[];
}

export interface ITranscription {
    speaker: string;
    text: string;
    startTime: string;
    endTime: string;
}

export interface IService {
    sid: string;
    friendlyName: string;
    dateCreated: string;
    dateUpdated: string;
}
export interface IServiceResponse {
    success: boolean;
    services: IService[];
}

export interface ICampaign {
    externalCampaignId: string;
    useCase: string;
    status: string;
    description: string;
    dateCreated: string;
    dateUpdated: string;
}

export interface ICampaignsResponse {
    success: boolean;
    campaigns: ICampaign[];
}

export interface IMessagingServiceConnect {
    messagingServiceSid: string;
    campaignSid: string;
}
