export interface IImportLeadPayload {
    id: number;
    formData: FormData;
}

export interface ILeadsImportData {
    leadsFile: File; // CSV or XLSX file
}

export interface IValidationError {
    row: number;
    attribute: string;
    errors: string[];
    values: any;
}
