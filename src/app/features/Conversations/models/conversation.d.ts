import { IUser } from '../../User Management/Users/models/user';
import { ILead } from '../../LeadManagement/Leads/models/lead';

export interface IConversationsResponse {
    success: boolean;
    message: string;
    conversations: IConversation[];
}

export interface IConversationResponse {
    success: boolean;
    message: string;
    conversation: IConversation;
}

export interface IConversationRequest {
    leadId: number;
    name: string | null;
}

export interface IConversation {
    id: number;
    company_id: number;
    user_id: number;
    lead_id: number;
    blocked: number;
    name: string | null;
    read: number;
    created_at: string;
    updated_at: string;
    messages_max_created_at: string;
    unread_messages_count: number;
    lead: ILead;
    user: IUser;
    latest_message: IMessage | null;
    channels: IChannel[];
}

export interface IMessage {
    id: number;
    conversation_id: number;
    channel_id: number;
    message_id: string | null;
    direction: 'OUTBOUND' | 'INBOUND';
    recipient: string;
    sender: string;
    subject: string;
    body: string;
    status: IMessageStatus;
    created_at: string;
    updated_at: string;
}

export type IMessageStatus = 'SENT' | 'RECEIVED' | 'PENDING' | 'FAILED';

export interface IChannel {
    id: number;
    conversation_id: number;
    name: string;
    user_contact: string;
    lead_contact: string;
    created_at: string;
    updated_at: string;
}

export interface IConversationalChannelsResponse {
    success: boolean;
    message: string;
    channels: IChannel[];
}

export interface IConversationMessagesResponse {
    success: boolean;
    message: string;
    messages: IMessage[];
}

export interface ISendMessageRequest {
    conversationId: number;
    channelId: number;
    subject: string;
    body: string;
}

export interface IQuickMessageRequest {
    channel: 'SMS' | 'EMAIL' | 'BOTH';
    recipient?: string;
    phoneNumber?: string;
    email?: string;
    subject: string;
    body: string;
}

export interface ISendMessageResponse {
    success: boolean;
    message: string;
    data: {
        message: IMessage;
    };
}

export interface IGetMessageStatusResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        status: IMessageStatus;
    };
}

export interface Conversation {
    id: string;
    name: string;
    initials: string;
    preview: string;
    time: string;
    unread: boolean;
    platform: 'WhatsApp' | 'Mail' | 'Message:' | 'Email';
}

export interface IMarkAsReadResponse {
    success: boolean;
    message: string;
    _id: string;
}
