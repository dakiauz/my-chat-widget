'use client';

import { useState } from 'react';
import { Button, Text, TextInput, Alert, Avatar, Group } from '@mantine/core';
import { UserIcon, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { IUser } from '../../User Management/Users/models/user';
import { ITwilioPurchasedPhoneNumber } from '../models/twillio';
import { useAssignTwilioPhoneNumberMutation } from '../services/TwillioApiSlice';
import { showNotification } from '@mantine/notifications';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import { IRootState } from '../../../store';
import { useSelector } from 'react-redux';
import { IAuthResponse } from '../../Authentication/models/auth';
import { loginSuccess } from '../../../slices/authSlice';
import { useDispatch } from 'react-redux';
import { useGetUserMutation } from '../../Authentication/services/authApi';
import { useNavigate } from 'react-router-dom';

interface AssignNumberModalProps {
    opened: boolean;
    onClose: () => void;
    number: ITwilioPurchasedPhoneNumber | null;
    users: IUser[];
}

export function AssignNumberModal({ opened, onClose, number, users }: AssignNumberModalProps) {
    const auth = useSelector((state: IRootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [authData] = useGetUserMutation();

    const filteredUsers = users.filter(
        (user) =>
            user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user?.roles && user?.roles[0].name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const selectedUser = users.find((u) => u.id === selectedUserId);

    const [assignTwilioPhoneNumber, { isLoading: loading }] = useAssignTwilioPhoneNumberMutation();

    const handleAssign = async () => {
        if (!selectedUserId || !number) return;
        try {
            await assignTwilioPhoneNumber({ phoneNumberId: number.id + '', userId: selectedUserId })
                .unwrap()
                .then(() => {
                    if (auth.user?.id == selectedUserId && auth.token) {
                        authData(auth.token)
                            .unwrap()
                            .then((res: IAuthResponse) => {
                                if (res.success) {
                                    let userData = {
                                        user: {
                                            ...res.data,
                                        },
                                        token: auth.token,
                                    };
                                    dispatch(loginSuccess(userData));
                                } else {
                                    navigate('/logout');
                                }
                            })
                            .catch((error: any) => {
                                navigate('/logout');
                            });
                    }

                    onClose();
                    setSelectedUserId(null);
                    setSearchTerm('');
                    showNotification({
                        title: 'Success',
                        message: `Phone number ${number.phoneNumber} assigned to ${selectedUser?.name || 'user'}.`,
                        color: 'green',
                    });
                })
                .catch((error) => {
                    showNotification({
                        title: 'Error',
                        message: error?.message || error?.data?.message || 'Failed to assign phone number',
                        color: 'red',
                    });
                });

            setSelectedUserId(null);
            setSearchTerm('');
        } catch (error) {
            console.error('Failed to assign phone number:', error);
        }
    };

    const handleClose = () => {
        onClose();
        setSelectedUserId(null);
        setSearchTerm('');
    };

    if (!number) return null;

    return (
        <Modal isOpen={opened} close={handleClose}>
            <ModalHeader title="Assign Phone Number" />
            <ModalBody>
                <div className="space-y-4">
                    {/* Number Info */}
                    <div className="bg-violet-50 p-4 rounded-lg">
                        <Text weight={500} className="mb-1">
                            {number.phoneNumber}
                        </Text>
                    </div>

                    {/* User Search */}
                    <TextInput icon={<UserIcon size={16} />} label="Search Users" placeholder="Search by name, email, or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                    {/* User Selection */}
                    <div>
                        <Text size="sm" weight={500} className="mb-2">
                            Select User ({filteredUsers.length} found)
                        </Text>

                        <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${selectedUserId === user.id ? 'bg-violet-50 border-violet-200' : ''}`}
                                    onClick={() => setSelectedUserId(user.id)}
                                >
                                    <Group>
                                        <Avatar size="sm" color="violet">
                                            {user?.name
                                                ?.split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </Avatar>

                                        <div className="flex-1">
                                            <Text size="sm" weight={500}>
                                                {user.name}
                                            </Text>
                                            <div className="flex items-center gap-2">
                                                <Mail size={12} />
                                                <Text size="xs" color="dimmed">
                                                    {user.email}
                                                </Text>
                                            </div>
                                            {user?.roles && (
                                                <Text size="xs" color="blue">
                                                    {user?.roles[0]?.name}
                                                </Text>
                                            )}
                                        </div>

                                        {selectedUserId === user.id && <CheckCircle size={16} className="text-violet-600" />}
                                    </Group>
                                </div>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-4">
                                <Text color="dimmed">No users found</Text>
                            </div>
                        )}
                    </div>

                    {/* Selected User Summary */}
                    {selectedUser && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <Text size="sm" weight={500} className="mb-2">
                                Assignment Summary
                            </Text>
                            <Text size="sm">
                                <strong>{number.phoneNumber}</strong> will be assigned to <strong>{selectedUser.name}</strong> ({selectedUser.email})
                            </Text>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" color="violet" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssign} loading={loading} disabled={!selectedUser} color="violet">
                            Assign Number
                        </Button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
}
