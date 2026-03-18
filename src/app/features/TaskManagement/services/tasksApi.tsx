import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';
import { ICreateTaskPayload, IGetTasksResponse, ITask } from '../models/task';

export const tasksApi: any = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createTask: builder.mutation<IGetTasksResponse, ICreateTaskPayload>({
            query: (formData) => ({
                url: '/tasks/create',
                method: 'POST',
                body: JSON.stringify({
                    leads: formData.leads,
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    dueDate: formData.dueDate,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Tasks'],
        }),

        getTasks: builder.query<IGetTasksResponse, void>({
            query: () => ({
                url: '/tasks/list',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Tasks'],
        }),

        deleteTask: builder.mutation<{ success: boolean; message: string }, number>({
            query: (taskId) => ({
                url: `/tasks/delete/${taskId}`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Tasks'],
        }),

        updateTask: builder.mutation<{ success: boolean; message: string }, { taskId: number; formData: ICreateTaskPayload }>({
            query: ({ taskId, formData }) => ({
                url: `/tasks/update/${taskId}`,
                method: 'PUT',
                body: formData,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Tasks'],
        }),
    }),
});

export const { useCreateTaskMutation, useGetTasksQuery, useDeleteTaskMutation, useUpdateTaskMutation } = tasksApi;

export default tasksApi;
