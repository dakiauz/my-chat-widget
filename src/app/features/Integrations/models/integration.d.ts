import { ITwilioSocialAccount } from './twillio';
import { IFacebookSocialAccount } from './facebook';
import { IEmailSocialAccount } from './imap';

export interface ISocialsResponse {
    success: boolean;
    message: string;
    socails: ISocialAccount;
}

export interface ISocialAccount {
    facebook: IFacebookSocialAccount | null;
    twilio: ITwilioSocialAccount | null;
    twilioPhoneNumber: {
        id: number;
        companyId: number;
        userId: number;
        phoneNumber: string;
        capabilities: string;
        status: string;
        created_at: string | null;
        updated_at: string;
    } | null;
    email: IEmailSocialAccount | null;
}
