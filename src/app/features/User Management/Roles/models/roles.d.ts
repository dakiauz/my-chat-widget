export interface IRole {
    id: number;
    name: string;
    description: string;
    permissions: IPermission[] | null;
}
export interface IPermission {
    id: number;
    name: string;
}

//forms
export interface IRolesFormData {
    description: string;
    id: number;
    name: string;
    permissions: number[];
}

//api

export interface IRolesMutationResponse {
    success: boolean;
    message: string;
}
export interface IRolesQueryResponse {
    success: boolean;
    data: {
        roles: IRole[];
    };
    message: string;
}
export interface IPermissionQueryResponse {
    success: boolean;
    data: IPermission[];
    message: string;
}
//payloads
export interface IAddRolePayload {
    name: string;
    permissions: number[];
    description: string;
}
export interface IUpdateRolePayload {
    roleId: number;
    formData: IAddRolePayload;
}
