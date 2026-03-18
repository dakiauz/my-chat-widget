export interface ILeadListResponse {
    success: boolean;
    message: string;
    leadList: ILeadList;
}

export interface ILeadListsResponse {
    success: boolean;
    message: string;
    data: {
        leadLists: ILeadList[];
    };
}

export interface ILeadList {
    company_id: number;
    name: string;
    description: string;
    updated_at?: string;
    created_at?: string;
    id: number;
}

export interface IAddLeadListRequest {
    name: string;
    description: string;
}

export interface IUpdateLeadListRequest {
    id: number;
    formData: IAddLeadListRequest;
}
