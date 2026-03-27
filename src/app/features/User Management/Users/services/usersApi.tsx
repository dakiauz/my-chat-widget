import { baseApi } from '../../../../slices/baseApiSlice';
import { getState } from '../../../../store';
import { IRolesQueryResponse } from '../../Roles/models/roles';
import { IAddUserPayload, IAddUsersResponse, IGetUsersResponse, IUpdateUserPayload } from '../models/user';

export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        addUser: builder.mutation<IAddUsersResponse, IAddUserPayload>({
            query: (formData) => ({
                url: '/users/create',
                method: 'POST',
                body: JSON.stringify({
                    roleId: formData.roleId, // ame
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Users'],
        }),

        getUsers: builder.query<IGetUsersResponse, void>({
            query: () => ({
                url: '/users/list',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Users'],
        }),
        updateUser: builder.mutation<IAddUsersResponse, IUpdateUserPayload>({
            query: ({ userId, formData }) => {
                return {
                    url: `/users/update/${userId}`,
                    method: 'PUT',
                    body: JSON.stringify({
                        roleId: formData.roleId, // 🔹 Change to `role_id`
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                    headers: {
                        Authorization: `Bearer ${getState().auth.token}`,
                        'Content-Type': 'application/json', // 🔹 Ensure JSON format
                    },
                };
            },
            invalidatesTags: ['Users'],
        }),

        deleteUser: builder.mutation<IAddUsersResponse, { id: number; force?: boolean }>({
            query: ({ id, force }) => ({
                url: `/users/delete/${id}${force ? '?force=true' : ''}`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Users'],
        }),
        transferUser: builder.mutation<IAddUsersResponse, { id: number; target_user_id: number }>({
            query: ({ id, target_user_id }) => ({
                url: `/users/transfer/${id}`,
                method: 'POST',
                body: JSON.stringify({ target_user_id }),
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ['Users'],
        }),
        getUserRoles: builder.query<IRolesQueryResponse, void>({
            query: () => ({
                url: '/roles/list',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Roles'],
        }),
    }),
});

export const { useGetUserRolesQuery, useAddUserMutation, useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation, useTransferUserMutation } = usersApi;

export default usersApi;
