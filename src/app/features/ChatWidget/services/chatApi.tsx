// chatApi.ts
import { baseApi } from "../../../../app/slices/baseApiSlice";
import { getState } from "../../../../app/store";

export interface ISendAgentMessageRequest {
  message: string;
  conversation_id: number;
}

export interface IChatMessage {
  id: number;
  conversation_id: number;
  sender_type: string; // e.g., "agent" | "client"
  message: string;
  created_at: string;
}

export interface IChatMessagesResponse {
  data: IChatMessage[];
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch messages for a conversation
    getConversationMessages: builder.query<IChatMessagesResponse, number>({
      query: (conversationId) => ({
        url: `/chat-widget/messages/${conversationId}`,
        headers: {
          Authorization: `Bearer ${getState().auth.token}`,
        },
      }),
      providesTags: ["Chat"],
    }),

    // Send agent message
    sendAgentMessage: builder.mutation<void, ISendAgentMessageRequest>({
      query: (payload) => ({
        url: `/chat-widget/send/agent`,
        method: "POST",
        body: payload,
        headers: {
          Authorization: `Bearer ${getState().auth.token}`,
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetConversationMessagesQuery,
  useSendAgentMessageMutation,
} = chatApi;

export default chatApi;
