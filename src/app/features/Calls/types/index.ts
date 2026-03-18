import { ICallLogRecording, IContact } from '../models/calls';

export interface CallState {
    isActive: boolean;
    isIncoming: boolean;
    isDialing: boolean;
    duration: string;
    contact: IContact | null;
    dialedNumber: string;
}

export interface CallLog {
    id: string;
    callSid: string;
    contactId: string;
    contactName: string;
    contactInitials: string;
    phone: string;
    type: 'incoming' | 'outgoing' | 'missed';
    callDuration: string;
    timestamp: string; // ISO string format instead of Date object
    status: 'completed' | 'missed' | 'declined';
    recording: ICallLogRecording[];
}

export interface IConversation {
    id: number;
    assigned?: boolean;
    user_id: number | null;
    company_id?: number | null;
    client_email?: string;
    client_name?: string;
    client_phone_number?: string;
    lastMessage: string;
    unread_count?: number;
    unread: boolean;
    created_at?: string;
    updated_at?: string;
    messages?: IMessage[];
    is_ai_active?: boolean;
}

export interface IMessage {
    id: number | string;
    message: string;
    sender_type: 'client' | 'agent';
    created_at?: string;
    updated_at?: string;
    timestamp?: string;
    chat_widget_conversation_id?: number;
    conversation_id?: number;
}

export type CallAction = 'mute' | 'keypad' | 'hold' | 'speaker' | 'end' | 'answer' | 'decline';

export type DialerState = 'idle' | 'dialing' | 'calling' | 'incoming' | 'active';
