import React, { useState } from 'react';
import { Select, Loader } from '@mantine/core';
import FormGroup from '@/app/shared/components/forms/FormGroup';
import FormLabel from '@/app/shared/components/forms/FormLabel';
import FormFeedback from '@/app/shared/components/forms/FormFeedback';
import { useGetUsersQuery } from '@/app/features/User Management/Users/services/usersApi';
import { useAssignLeadsMutation } from '../services/leadsApi';
import { showNotification } from '@mantine/notifications';

interface AssignLeadsProps {
    leadIds: number[];
    close: () => void;
    onSuccess?: () => void;
}

function AssignLeads({ leadIds, close, onSuccess }: AssignLeadsProps) {
    const { data: usersData, isFetching: isUsersFetching } = useGetUsersQuery();
    const [assignLeads, { isLoading: isAssigning }] = useAssignLeadsMutation();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleAssign = async () => {
        if (!selectedUser) {
            setError('Please select a user.');
            return;
        }

        try {
            await assignLeads({
                userId: Number(selectedUser),
                leadIds,
            }).unwrap();
            console.log('[DEBUG] AssignLeads: assign success');
            showNotification({
                title: 'Success',
                message: 'Leads Assigned successfully',
                color: 'green',
            });

            if (onSuccess) onSuccess();
            close(); // close modal on success
        } catch (err) {
            showNotification({
                title: 'Error',
                message: 'Failed to assign leads',
                color: 'red',
            });
            close();
            console.error('Error assigning leads:', err);
        }
    };

    const usersOptions =
        usersData?.data?.users?.map((user: any) => ({
            value: String(user.id),
            label: user.name,
        })) ?? [];

    return (
        <div className="flex flex-col space-y-6">
            <FormGroup>
                <FormLabel htmlFor="userId">Select User</FormLabel>
                <Select
                    id="userId"
                    placeholder={isUsersFetching ? 'Loading users...' : 'Select a user'}
                    data={usersOptions}
                    value={selectedUser}
                    onChange={(val) => {
                        setSelectedUser(val);
                        setError('');
                    }}
                    searchable
                    nothingFound={isUsersFetching ? <Loader size="sm" /> : 'No users found'}
                    clearable
                    disabled={isUsersFetching || isAssigning}
                />
                {error && <FormFeedback error={error} />}
            </FormGroup>

            {/* Footer Buttons */}
            <div className="flex justify-end items-center space-x-4 border-t pt-4">
                <button type="button" className="px-6 py-2 bg-BG border-BG rounded-lg transition" onClick={close} disabled={isAssigning}>
                    Cancel
                </button>
                <button type="button" onClick={handleAssign} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition disabled:opacity-50" disabled={isAssigning}>
                    {isAssigning ? 'Assigning...' : 'Assign'}
                </button>
            </div>
        </div>
    );
}

export default AssignLeads;
