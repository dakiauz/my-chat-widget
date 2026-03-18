import { baseApi } from '../../../slices/baseApiSlice';
import { getState } from '../../../store';

export interface IVoicemailDrop {
    id: number;
    company_id: number;
    user_id: number | null;
    name: string;
    file_path: string;
    duration: number | null;
    audio_url: string;
    created_at: string;
    updated_at: string;
}

export interface IVoicemailDropListResponse {
    data: IVoicemailDrop[];
}

export const voicemailDropApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVoicemailDrops: builder.query<IVoicemailDropListResponse, void>({
            query: () => ({
                url: '/voicemails',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            providesTags: ['Voicemails'],
        }),
        uploadVoicemailDrop: builder.mutation<{ message: string; data: IVoicemailDrop }, FormData>({
            query: (body) => ({
                url: '/voicemails',
                method: 'POST',
                body,
                headers: {
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Voicemails'],
        }),
        deleteVoicemailDrop: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/voicemails/${id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            }),
            invalidatesTags: ['Voicemails'],
        }),
    }),
});

export const {
    useGetVoicemailDropsQuery,
    useUploadVoicemailDropMutation,
    useDeleteVoicemailDropMutation,
} = voicemailDropApi;
