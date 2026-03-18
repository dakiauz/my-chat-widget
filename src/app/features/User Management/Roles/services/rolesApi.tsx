import { baseApi } from '../../../../slices/baseApiSlice';
import { getState } from '../../../../store';
import { IAddRolePayload, IPermissionQueryResponse, IRolesQueryResponse, IUpdateRolePayload } from '../models/roles';

export const rolesApi: any = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        //Queries
        getRoles: builder.query<IRolesQueryResponse, null>({
            query: () => ({
                url: '/roles/list',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Roles'],
        }),
        deleteRole: builder.mutation<IRolesQueryResponse, number>({
            query: (roleId) => ({
                url: `/roles/delete/${roleId}`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Roles'],
        }),
        //mutations
        addRole: builder.mutation<IRolesQueryResponse, IAddRolePayload>({
            query: (formData) => ({
                url: '/roles/create',
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Roles'],
        }),
        updateRole: builder.mutation<IRolesQueryResponse, IUpdateRolePayload>({
            query: (v) => ({
                url: `/roles/update/${v.roleId}`,
                method: 'PUT',
                body: v.formData,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Roles'],
        }),
        getPermissions: builder.query<IPermissionQueryResponse, null>({
            query: () => ({
                url: '/roles/permissions',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
        }),
    }),
});

export const { useGetRolesQuery, useGetPermissionsQuery, useUpdateRoleMutation, useAddRoleMutation, useDeleteRoleMutation } = rolesApi;

export default rolesApi;
