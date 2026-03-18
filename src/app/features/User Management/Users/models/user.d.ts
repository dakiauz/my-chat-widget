import { IEmailSocialAccount } from '../../../Integrations/models/imap';
import { IRole } from '../../Roles/models/roles';

export interface IUser {
    id: number;
    name?: string;
    email?: string;
    company_id: number;
    company?: {
        id: number;
        name: string;
        email: string;
        address: string | null;
        phoneNumber: string | null;
        website: string | null;
        created_at: string;
        updated_at: string;
        stripe_id: null | string;
        messaging_service?: {
            id: number;
            sid: string;
            campaignSid: string;
            companyId: number;
            userId: number;
            friendlyName: string;
            useCase: string;
            campaignDescription: string;
            campaignStatus: string;
            campaignDateCreated: string; // ISO datetime string
            campaignDateUpdated: string; // ISO datetime string
            created_at: string; // Laravel timestamp
            updated_at: string; // Laravel timestamp
        };
        subscription: {
            name: string;
            active: boolean;
            features: Array<{
                name: string;
                lookup: string;
                metadata: any[];
            }>;
        } | null;
        is_ai_ready?: boolean;
    };
    email_verified_at?: string | null;
    email_configuration?: {
        id: number;
        created_at: string | null;
        outlook_status: string | null;
        updated_at: string | null;
        user_id: number;
        username: string | null;
    };
    roles?: IRole[];
    message?: string;
    token?: string | null;
    twilio_phone_number?: {
        id: number;
        companyId: number;
        userId: number;
        phoneNumber: string;
        capabilities: string;
        status: string;
        created_at: string | null;
        updated_at: string;
    };
    email_integration?: IEmailSocialAccount | null;
}

// forms

export interface IUserFormData {
    roleId: any;
    id: number;
    name: string;
    email: string;
    password: string;
    role: any;
}

export type SubmitUserFormDataType = {
    roleId: number;
    name: string;
    email: string;
    password: string;
};

// api

export interface IAddUsersResponse {
    success: boolean;
    message: string;
}

export interface IGetUsersResponse {
    success: boolean;
    data: {
        users: IUser[];
    };
    message: string;
}

//Payloads
export interface IAddUserPayload {
    name: string;
    email: string;
    roleId: number;
    password: string;
}
export interface IUpdateUserPayload {
    userId: number;
    formData: SubmitUserFormDataType;
}
