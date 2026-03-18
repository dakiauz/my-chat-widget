export interface IMapConnectRequest {
    outgoing_server: string;
    incomming_server: string;
    incomming_port: number;
    outgoing_port: number;
    username: string;
    password: string;
}

export interface IEmailSocialAccount {
    id: number;
    company_id: number;
    incomming_server: string;
    outgoing_server: string;
    incomming_port: string;
    outgoing_port: string;
    username: string;
    created_at: string;
    updated_at: string;
}

export interface IOutlookConnectResponse {
    success: boolean;
    redirected_url: string;
}
