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

        deleteUser: builder.mutation<IAddUsersResponse, number>({
            query: (userId) => ({
                url: `/users/delete/${userId}`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
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

export const { useGetUserRolesQuery, useAddUserMutation, useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation } = usersApi;

export default usersApi;
