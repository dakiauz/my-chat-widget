import { ILeadList } from '../../LeadManagement/LeadList/models/leadsList';

export interface IFacebookSocialAccount {
    id: number;
    company_id: number;
    fb_token: string;
    fb_page_id: string | null;
    fb_page_token: string | null;
    created_at: string;
    updated_at: string;
}

export interface IFacebookPagesResponse {
    success: boolean;
    pages: IFacebookPage[];
}

export interface IFacebookPage {
    access_token: string;
    category: string;
    category_list: IFacebookCategory[];
    name: string;
    id: string;
    tasks: string[];
}

export interface IFacebookCategory {
    id: string;
    name: string;
}

export interface IFacebookLoginResponse {
    loginUrl: string;
    success: boolean;
}

export interface IFacebookLeadgenFormsResponse {
    success: boolean;
    message: string;
    data: IFacebookLeadgenForm[];
}

export interface IFacebookConnectedLeadgenFormsResponse {
    success: boolean;
    message: string;
    data: IFacebookConnectedLeadgenForm[];
}

export interface IFacebookConnectedLeadgenForm {
    id: string;
    company_id: number;
    form_id: string;
    name: string | null;
    locale: string | null;
    status: string;
    fields: string[] | null;
    lead_list_id: number;
    lead_list: ILeadList;
    created_at: string;
    updated_at: string;
}

export interface IFacebookLeadgenForm {
    questions: any;
    id: string;
    locale: string;
    name: string;
    status: string;
}
