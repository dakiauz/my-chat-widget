import { IAddLeadResponse, IAddLeadPayload } from './../../Leads/models/lead.d';
export interface ILeadStatus {
    id: number;
    leadlist_id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ILeadStatusesResponse {
    success: boolean;
    message: string;
    data: {
        statuses: ILeadStatus[];
    };
}

export interface ILeadStatusResponse {
    success: boolean;
    message: string;
    data: {
        status: ILeadStatus[];
    };
}

export interface ILeadStatusFormData {
    name: string;
}

export interface IAddLeadStatusRequest {
    leadlist_id: number;
    formData: ILeadStatusFormData;
}

export interface IUpdateLeadStatusRequest {
    id: number;
    formData: ILeadStatusFormData;
}
