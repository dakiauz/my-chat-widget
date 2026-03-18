import React from 'react';
import { useGetMessagesQuery } from '../../features/Conversations/services/conversationsApiSlice';
import ConversationsLayout from '../../features/Conversations/components/ConversationsLayout';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';

function View() {
    const email = useSelector((state: IRootState) => state.auth.user?.email_integration);
    const { data } = useGetMessagesQuery(undefined, {
        skip: !email,
    });
    return (
        <>
            <ConversationsLayout />
        </>
    );
}

export default View;
