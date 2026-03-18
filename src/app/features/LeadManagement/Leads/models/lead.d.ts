import { IUser } from '../../../User Management/Users/models/user';
import { ILeadList } from '../../LeadList/models/leadsList';

export interface ILead {
    customFields: any;
    customField: any;
    id: number;
    user_id: number;
    company_id: number;
    lead_list_id: number;
    status_id: number | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string;
    source: 'MANUAL ENTRY' | 'CSV UPLOAD' | 'CHAT WIDGET' | 'FACEBOOK' | '';
    companyName: string | null;
    websiteUrl: string | null;
    jobTitle: string | null;
    socialMediaUrl: string | null;
    companyLinkedInUrl: string | null;
    created_at: string;
    updated_at: string;
    note?: string;
    user?: IUser;
    lead_list?: ILeadList;
    status?: ILeadStatus;
    assigned_to?: AssignedTo[];
    otherFields?: null | string;
    classification?: 'Hot' | 'Cold' | 'Warm' | null;
    disposition?: string | null;
}

export interface AssignedTo {
    email: string;
    id: number;
    name: string;
}

export interface ILeadStatus {
    id: number;
    leadlist_id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface IAddLeadResponse {
    success: boolean;
    message: string;
    data?: ILead;
}

export interface IUpdateLeadPayload {
    id: number;
    formData: IAddLeadPayload;
}

export interface IGetLeadsResponse {
    success: boolean;
    leads: ILead[];
}

export interface IAddLeadPayload {
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string;
    companyName: string | null;
    websiteUrl: string | null;
    jobTitle: string | null;
    socialMediaUrl: string | null;
    companyLinkedInUrl: string | null;
    classification?: string | null;
    statusId: number | null;
    lead_list_id: number;
}

export interface ILeadsResponse {
    success: boolean;
    message: string;
    data: {
        leads: ILead[];
    };
}
export interface ILeadsDeletePayload {
    leadIds: number[];
}
export interface ILeadsDeleteResponse {
    success: boolean;
    message: string;
}

export interface ILeadResponse {
    success: boolean;
    message: string;
    lead: ILead;
}

export interface ILeadFormData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    websiteUrl: string;
    jobTitle: string;
    socialMediaUrl: string;
    companyLinkedInUrl: string;
    classification: string;
    status: LeadStatus;
}

interface SubmitLeadFormDataType {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    websiteUrl: string;
    jobTitle: string;
    socialMediaUrl: string;
    companyLinkedInUrl: string;
    status: number;
}

interface ILeadsPageProps {
    data: ILead[];
    fetching?: boolean;
    users: IUser[];
    permissions: [];
}

export interface ILeadsAssignPayload {
    userId: number;
    leadIds: number[];
}
