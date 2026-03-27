import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from '@mantine/core';
import { useGetUsersQuery, useTransferUserMutation } from '../../services/usersApi';
import { addAlert } from '../../../../../slices/usersSlice';
import { IRootState } from '../../../../../store';

type TransferDataModalProps = {
    userId: number;
    close: () => void;
};

export default function TransferDataModal({ userId, close }: TransferDataModalProps) {
    const dispatch = useDispatch();
    const [targetUserId, setTargetUserId] = useState<string | null>(null);
    const { data: usersData, isFetching } = useGetUsersQuery();
    const [transferUser, { isLoading }] = useTransferUserMutation();

    const usersOptions =
        usersData?.data?.users
            ?.filter((u: any) => u.id !== userId)
            ?.map((u: any) => ({
                value: String(u.id),
                label: u.name,
            })) ?? [];

    const handleTransfer = () => {
        if (!targetUserId) {
            dispatch(addAlert({ variant: 'warning', title: 'Warning', message: 'Please select a target user' }));
            return;
        }

        transferUser({ id: userId, target_user_id: Number(targetUserId) })
            .unwrap()
            .then((payload: any) => {
                dispatch(
                    addAlert({
                        variant: payload.success ? 'success' : 'warning',
                        message: payload.message,
                        title: payload.success ? 'Success!' : 'Warning!',
                    })
                );
                if (payload.success) close();
            })
            .catch((error: any) => {
                dispatch(
                    addAlert({
                        variant: 'danger',
                        message: error?.data?.message || error?.message || 'Failed to transfer user data.',
                        title: 'Error!',
                    })
                );
            });
    };

    return (
        <div className="p-5">
            <h2 className="text-lg font-bold mb-4">Transfer User Data</h2>
            <p className="text-sm text-gray-600 mb-4">
                Select a user to transfer all Leads, Lead Lists, Tasks, and Conversations to.
            </p>

            <Select
                placeholder="Select Target User"
                data={usersOptions}
                value={targetUserId}
                onChange={setTargetUserId}
                searchable
                clearable
                disabled={isFetching}
                className="mb-5"
            />

            <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn btn-outline-danger" onClick={close} disabled={isLoading}>
                    Cancel
                </button>
                <button type="button" className="btn bg-primary text-white p-2 rounded-lg" onClick={handleTransfer} disabled={isLoading || !targetUserId}>
                    {isLoading ? 'Transferring...' : 'Transfer Data'}
                </button>
            </div>
        </div>
    );
}
