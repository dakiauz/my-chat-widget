import { IUser } from './../../User Management/Users/models/user.d';
export interface ILoginPayload {
    email: string;
    password: string;
}
export interface IAuthResponse {
    success: boolean;
    message: string;
    data: IAuthState;
}

export interface IAuthState {
    company: any;
    session: any;
    token: string | null;
    user: IUser | null;
    error: string | null;
    loading: boolean;
    permissions: string[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

export interface IRegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    company_url: string;
}


export interface IResetPasswordPayload {
    email: string;
    password: string;
    password_confirmation: string;
}

export interface IResetLinkPayload {
    email: string;
}

export interface IVerifyEmailPayload {
    id: string;
    hash: string;
}

export interface IEmailVerificationPayload {
    id: string;
    hash: string;
}

export interface IEmailVerificationResponse {
    success: boolean;
    message: string;
}
