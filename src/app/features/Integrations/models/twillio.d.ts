export interface ITwilioSubaccountCreateRequest {
    accountSid: string;
    authToken: string;
}

export interface ITwilioSocialAccount {
    id: number;
    company_id: number;
    accountSid: string;
    authToken: string;
    friendlyName: string;
    twimlApplicationSid: string | null;
    status: string;
    apiKeySid: string | null;
    serviceSid: string | null;
    apiKeySecret: string | null;
    created_at: string;
    updated_at: string;
}

export interface ITwilioAvailablePhoneNumber {
    phoneNumber: string;
    friendlyName: string;
    isoCountry: string;
    capabilities: {
        sms: boolean;
        voice: boolean;
    };
}

export interface ITwilioPurchasedPhoneNumber {
    id: number;
    userId: number | null;
    companyId: number;
    phoneNumber: string;
    friendlyName: string;
    isoCountry: string;
    capabilities: {
        sms: boolean;
        voice: boolean;
    };
}

export interface ITwilioCountriesResponse {
    success: boolean;
    message: string;
    countries: ITwilioCountry[];
}

export interface ITwilioCountry {
    id: number;
    name: string;
    code: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface ITwilioAvailableNumbersResponse {
    success: boolean;
    message: string;
    availableNumbers: ITwilioAvailablePhoneNumber[];
}

export interface ITwilioPurchasedNumbersResponse {
    success: boolean;
    message: string;
    purchasedNumbers: ITwilioPurchasedPhoneNumber[];
}

export interface ITwilioAvailableNumbersRequest {
    country: string;
    areaCode?: number;
    city?: string;
}

export interface ITwilioBuyNumbersRequest {
    phoneNumber: string;
}
