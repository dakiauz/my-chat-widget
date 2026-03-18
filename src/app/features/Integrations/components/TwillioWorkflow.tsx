import { useState, useEffect, useMemo } from 'react';
import { TextInput, Button, Text, Select, Badge, Loader, Alert, Tabs, Table, Group, ActionIcon } from '@mantine/core';
import { CheckCircle, Phone, Activity, Settings, Search, Plus, Users, User, Trash2, UserRoundX, MessageCircle } from 'lucide-react';
import {
    useBugTwilioPhoneNumberMutation,
    useConnectServiceMutation,
    useCreateTwilioSubaccountMutation,
    useGetMessagingServiceQuery,
    useGetPurchasedPhoneNumbersQuery,
    useGetServiceCampaignsQuery,
    useUnAssignTwilioPhoneNumberMutation,
} from '../services/TwillioApiSlice';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import { useGetIntegrationsQuery } from '../services/IntegrationApi';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import { Card } from '../../Calls/components/ui/card';
import { useGetUsersQuery } from '../../User Management/Users/services/usersApi';
import { showNotification } from '@mantine/notifications';
import { PurchaseNumbersModal } from '../Twillio/PurchaseNumberModal';
import { AssignNumberModal } from '../Twillio/AssignNumberModal';
import { ITwilioPurchasedPhoneNumber } from '../models/twillio';
import DeleteNumberModal from '../Twillio/DeleteNumberModal';
import { useGetUserMutation } from '../../Authentication/services/authApi';
import { IAuthResponse } from '../../Authentication/models/auth';
import { IRootState } from '../../../store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../../slices/authSlice';
import { useDispatch } from 'react-redux';
import { getNumberFlag } from '../../Calls/components/contacts/ContactList';
import { formatPhoneNumber, hasRole } from '../../../shared/utils/utils';
import { skipToken } from '@reduxjs/toolkit/query';
import FormLabel from '@/app/shared/components/forms/FormLabel';

interface TwilioWorkflowProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TwilioWorkflow({ opened, onClose, onSuccess }: TwilioWorkflowProps) {
    // State for the current step
    const [step, setStep] = useState(1);
    const user = useSelector((state: IRootState) => state.auth.user);

    // Form state
    const [friendlyName, setFriendlyName] = useState('');
    const [selectedNumber, setSelectedNumber] = useState<ITwilioPurchasedPhoneNumber | null>(null);
    const [accountSid, setAccountSid] = useState('');
    const [authToken, setAuthToken] = useState('');

    // UI state
    const { data: purchasedNumbersData, isFetching: isFetchingPurchasedNumbers } = useGetPurchasedPhoneNumbersQuery(undefined, {
        skip: !opened,
    });
    const [messagingService, setMessagingService] = useState<string>('all');
    const [campaignId, setCampaignId] = useState<string>('all');
    const [connectService, { isLoading }] = useConnectServiceMutation();
    const { data: services } = useGetMessagingServiceQuery();
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const { data: campaigns } = useGetServiceCampaignsQuery(messagingService !== 'all' ? messagingService : skipToken);
    const numbers = useMemo(() => {
        if (!purchasedNumbersData?.purchasedNumbers) return [];
        return purchasedNumbersData.purchasedNumbers;
    }, [purchasedNumbersData?.purchasedNumbers]);

    //Endpoints
    const [createTwillioSubAccount, { isLoading: isCreatingSubAccount }] = useCreateTwilioSubaccountMutation();
    const [buyPhoneNumber, { isLoading: isBuyingPhoneNumber }] = useBugTwilioPhoneNumberMutation();

    // Reset state when modal opens/closes

    const resetState = () => {
        setStep(1);
        setFriendlyName('');
        setSelectedNumber(null);
    };

    const handleCreateSubAccount = () => {
        createTwillioSubAccount({
            accountSid,
            authToken,
        })
            .unwrap()
            .then((res) => {
                showNotification({
                    title: 'Success',
                    message: res?.message || 'Subaccount created successfully!',
                    color: 'green',
                });
                setStep(2);
            })
            .catch((err) => {
                showNotification({
                    title: 'Error',
                    message: err?.data?.message || 'Something went wrong',
                    color: 'red',
                });
            });
    };

    // Step 2: Search for numbers
    // const searchNumbers = (countryCode: string) => {
    //     setLoading(true);
    //     setError(null);
    //     setCountry('US');
    // };

    // Step 3: Confirm purchase
    const handleConfirmSelection = () => {
        if (!selectedNumber) {
            return;
        }
        setStep(3);
    };

    // Step 4: Buy number
    const handleBuyNumber = () => {
        if (!selectedNumber) return;

        // Simulate API call
        buyPhoneNumber({
            phoneNumber: selectedNumber.phoneNumber,
        })
            .unwrap()
            .then(() => {
                setStep(4);
            });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const { data: usersData, isFetching: isFetchingUsers } = useGetUsersQuery(undefined, {
        skip: !opened,
    });

    //
    const unregisteredTwilioPhoneNumberUsers = useMemo(() => {
        if (!usersData?.data?.users) return [];
        return usersData.data.users.filter((user) => !user.twilio_phone_number);
    }, [usersData?.data?.users]);

    // Filter numbers based on search term and status
    useEffect(() => {
        if (searchTerm || filterStatus !== 'all') {
            setSearchTerm(searchTerm);
            setFilterStatus(filterStatus);
        }
    }, [searchTerm, filterStatus]);

    // Filter numbers based on search and status
    const filteredNumbers = numbers.filter((number) => {
        const user = usersData?.data?.users?.find((user) => user.id === number.userId);
        const matchesSearch =
            number.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesStatus = filterStatus === 'all' || (filterStatus === 'assigned' && number.userId) || (filterStatus === 'unassigned' && !number.userId);

        return matchesSearch && matchesStatus;
    });

    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    // Helper function to parse capabilities
    const parseCapabilities = (capabilities: string | { sms: boolean; voice: boolean }) => {
        if (typeof capabilities === 'string') {
            try {
                return JSON.parse(capabilities);
            } catch {
                return { sms: false, voice: false };
            }
        }
        return capabilities;
    };

    const getUserById = (userId: number | null) => {
        if (!userId) return null;
        return usersData?.data?.users?.find((user) => user.id === userId) || null;
    };
    //

    const [unAssignTwilioPhoneNumber, { isLoading: isUnassigning }] = useUnAssignTwilioPhoneNumberMutation();
    const [authData] = useGetUserMutation();
    const auth = useSelector((state: IRootState) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectedNumberId, setSelectedNumberId] = useState<number | null>(null);
    const handleUnassignNumber = async (number: ITwilioPurchasedPhoneNumber) => {
        try {
            await unAssignTwilioPhoneNumber({ phoneNumberId: number.id + '' })
                .unwrap()
                .then(() => {
                    // If the unassigned number belongs to the current user, refresh auth data
                    if (auth.user?.id == number.userId && auth.token) {
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
                            })
                            .finally(() => {
                                window.location.reload();
                            });
                    }

                    setSearchTerm('');
                    showNotification({
                        title: 'Success',
                        message: `Phone number ${number.phoneNumber} unassigned successfully.`,
                        color: 'green',
                    });
                })
                .catch((error) => {
                    showNotification({
                        title: 'Error',
                        message: error?.message || error?.data?.message || 'Failed to unassign phone number',
                        color: 'red',
                    });
                });
            setSearchTerm('');
        } catch (error) {
            console.error('Failed to assign phone number:', error);
        }
    };

    const handleAssignNumberCall = async (number: any, userId: number) => {
        try {
            // const response = await TwilioAPI.assignNumberToUser(number.id, userId);
            const response = {
                success: true,
                message: 'Phone number assigned successfully',
            };
            showNotification({
                title: 'Success',
                message: response.message,
                color: 'green',
            });
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error?.data?.message || error?.message || 'Failed to assign phone number',
                color: 'red',
            });
        }
    };

    const handleCreate = async () => {
        if (messagingService === 'all' || campaignId === 'all') {
            alert('Please select both a Messaging Service and a Campaign');
            return;
        }

        try {
            const payload = {
                messagingServiceSid: messagingService,
                campaignSid: campaignId,
            };

            const result = await connectService(payload).unwrap();
            showNotification({
                title: 'Success',
                message: 'Messaging Service linked with Campaign successfully!',
                color: 'green',
            });
            onClose(); // close modal or perform cleanup
        } catch (err) {
            showNotification({
                title: 'Error',
                message: 'Failed to connect service. Please try again.',
                color: 'red',
            });
        }
    };

    const handleAssignNumber = (number: ITwilioPurchasedPhoneNumber) => {
        setSelectedNumber(number);
        setAssignModalOpen(true);
    };

    const handleDeleteNumber = async (number: any) => {
        setSelectedNumber(number);
        setDeleteModalOpen(true);
    };
    const editPhoneNumberPermission = useMemo(() => {
        return hasRole('Edit Phone Number', true, auth);
    }, [auth]);
    const buyPhoneNumberPermission = useMemo(() => {
        return hasRole('Buy Phone Number', true, auth);
    }, [auth]);

    const viewPhoneNumberPermission = useMemo(() => {
        return hasRole('View Phone Number', true, auth);
    }, [auth]);

    // Render different content based on current step
    const renderStepContent = () => {
        // Permission checks for each step
        if (step === 1 && !editPhoneNumberPermission) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <Settings size={48} className="mx-auto text-gray-400 mb-4" />
                    <Text size="lg" weight={500} className="mb-2">
                        You do not have permission to create or edit Twilio accounts.
                    </Text>
                    <Text color="dimmed" className="mb-4">
                        Please contact your administrator if you need access.
                    </Text>
                </div>
            );
        }
        if (step === 2 && !editPhoneNumberPermission) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <Text size="lg" weight={500} className="mb-2">
                        You do not have permission to view Twilio account creation status.
                    </Text>
                    <Text color="dimmed" className="mb-4">
                        Please contact your administrator if you need access.
                    </Text>
                </div>
            );
        }
        if (step === 3 && !viewPhoneNumberPermission) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <Phone size={48} className="mx-auto text-gray-400 mb-4" />
                    <Text size="lg" weight={500} className="mb-2">
                        You do not have permission to view phone numbers.
                    </Text>
                    <Text color="dimmed" className="mb-4">
                        Please contact your administrator if you need access.
                    </Text>
                </div>
            );
        }

        switch (step) {
            case 1:
                return (
                    <div className="py-4">
                        <TextInput
                            required
                            label="Account SID"
                            placeholder="Enter your Twilio Account SID"
                            description="You can find this in your Twilio console"
                            value={accountSid}
                            onChange={(e) => setAccountSid(e.target.value)}
                            className="mb-4"
                            disabled={isCreatingSubAccount}
                        />

                        <TextInput
                            required
                            label="Auth Token"
                            placeholder="Enter your Twilio Auth Token"
                            description="You can find this in your Twilio console"
                            value={authToken}
                            onChange={(e) => setAuthToken(e.target.value)}
                            className="mb-4"
                            disabled={isCreatingSubAccount}
                        />

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={onClose} disabled={isCreatingSubAccount}>
                                Cancel
                            </Button>
                            <Button color="violet" onClick={handleCreateSubAccount} loading={isCreatingSubAccount}>
                                {isCreatingSubAccount ? 'Connecting...' : 'Connect'}
                            </Button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="py-4">
                        <div className="flex flex-col items-center ">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="text-green-500" size={32} />
                            </div>

                            <Text size="xl" weight={600} className="mb-4 text-center">
                                Account Created Successfully!
                            </Text>

                            <div className="bg-gray-50 p-4 rounded-lg mb-4 w-full">
                                <Text weight={500} className="mb-2">
                                    Account Details:
                                </Text>

                                <div className="space-y-2">
                                    <div>
                                        <Text size="sm" color="dimmed">
                                            Name:
                                        </Text>
                                        <Text weight={500}>{socialsData?.socails?.twilio?.friendlyName}</Text>
                                    </div>

                                    <div>
                                        <Text size="sm" color="dimmed">
                                            SID:
                                        </Text>
                                        <Text size="sm" className="font-mono">
                                            {socialsData?.socails?.twilio?.accountSid}
                                        </Text>
                                    </div>

                                    <div>
                                        <Text size="sm" color="dimmed">
                                            Status:
                                        </Text>
                                        <Badge size="sm" color={socialsData?.socails?.twilio?.status === 'active' ? 'green' : 'yellow'}>
                                            {socialsData?.socails?.twilio?.status}
                                        </Badge>
                                    </div>
                                    {socialsData?.socails?.twilio?.created_at && (
                                        <div>
                                            <Text size="sm" color="dimmed">
                                                Created:
                                            </Text>
                                            <Text size="sm">{new Date(socialsData?.socails?.twilio?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Text className="text-center mb-6" size="sm" color="dimmed">
                                Your SubAccount is ready! You can now manage phone numbers and configure settings.
                            </Text>

                            <Button color="violet" onClick={() => setStep(3)}>
                                Manage Account
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <Tabs defaultValue="numbers">
                            <Tabs.List>
                                <Tabs.Tab value="numbers">
                                    <span className="flex items-center gap-2">
                                        <Phone size={16} /> Phone Numbers ({numbers.length})
                                    </span>
                                </Tabs.Tab>
                                <Tabs.Tab value="analytics">
                                    <span className="flex items-center gap-2">
                                        <Activity size={16} />
                                        Analytics
                                    </span>
                                </Tabs.Tab>
                                <Tabs.Tab value="settings">
                                    <span className="flex items-center gap-2">
                                        <Settings size={16} />
                                        Settings
                                    </span>
                                </Tabs.Tab>
                                <Tabs.Tab value="messagingService">
                                    <span className="flex items-center gap-2">
                                        <MessageCircle size={16} />
                                        Messaging Service
                                    </span>
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="numbers" className="pt-4">
                                {/* Controls */}
                                <div className="flex flex-wrap gap-4 mb-4 justify-center items-center">
                                    <TextInput
                                        icon={<Search size={16} />}
                                        placeholder="Search numbers or users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1 basis-32"
                                    />
                                    <div className="flex gap-4">
                                        <Select
                                            placeholder="Filter by status"
                                            data={[
                                                { value: 'all', label: 'All Numbers' },
                                                { value: 'assigned', label: 'Assigned' },
                                                { value: 'unassigned', label: 'Unassigned' },
                                            ]}
                                            value={filterStatus}
                                            onChange={(value) => setFilterStatus(value || 'all')}
                                            className="w-48"
                                        />

                                        <Button
                                            onClick={() => setPurchaseModalOpen(true)}
                                            color="violet"
                                            disabled={!buyPhoneNumberPermission}
                                            title={!buyPhoneNumberPermission ? 'You do not have permission to buy phone numbers' : undefined}
                                        >
                                            <Plus size={16} /> Purchase Numbers
                                        </Button>
                                    </div>
                                </div>

                                {/* Numbers Table or Empty State */}
                                {isFetchingPurchasedNumbers ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Loader color="violet" size="md" className="mb-4" />
                                        <Text>Loading phone numbers...</Text>
                                    </div>
                                ) : numbers.length === 0 ? (
                                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                                        <Phone size={48} className="mx-auto text-gray-400 mb-4" />
                                        <Text size="lg" weight={500} className="mb-2">
                                            No Phone Numbers Yet
                                        </Text>
                                        <Text color="dimmed" className="mb-4">
                                            Get started by purchasing your first phone number for this SubAccount.
                                        </Text>
                                        <Button onClick={() => setPurchaseModalOpen(true)} color="violet">
                                            <Plus size={16} /> Purchase Your First Number
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>Phone Number</th>
                                                    <th>Capabilities</th>
                                                    <th>Assigned To</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredNumbers.map((number, index) => {
                                                    const capabilities = parseCapabilities(number.capabilities);
                                                    const user = getUserById(number.userId);

                                                    return (
                                                        <tr key={index}>
                                                            <td>
                                                                <Text weight={500}>
                                                                    <span className="text-sm font-[600] text-gray-900 font-urbanist flex gap-2 justify-center items-center ">
                                                                        {
                                                                            <img
                                                                                className="w-4 h-4"
                                                                                alt={getNumberFlag(number.phoneNumber)}
                                                                                src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${getNumberFlag(number.phoneNumber)}.svg`}
                                                                            />
                                                                        }
                                                                        {formatPhoneNumber(number.phoneNumber).display}
                                                                    </span>
                                                                </Text>
                                                            </td>
                                                            <td>
                                                                <div className="flex gap-1">
                                                                    {capabilities.voice && (
                                                                        <Badge size="xs" color="blue">
                                                                            Voice
                                                                        </Badge>
                                                                    )}
                                                                    {capabilities.sms && (
                                                                        <Badge size="xs" color="green">
                                                                            SMS
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {user ? (
                                                                    <div>
                                                                        <Text size="sm" weight={500}>
                                                                            {user.name}
                                                                        </Text>
                                                                        <Text size="xs" color="dimmed">
                                                                            {user.email}
                                                                        </Text>
                                                                    </div>
                                                                ) : (
                                                                    <Text size="sm" color="dimmed">
                                                                        Unassigned
                                                                    </Text>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    {number.userId ? (
                                                                        <ActionIcon
                                                                            disabled={isUnassigning || !editPhoneNumberPermission}
                                                                            size="sm"
                                                                            variant="light"
                                                                            color="orange"
                                                                            onClick={() => {
                                                                                setSelectedNumberId(number.id);
                                                                                handleUnassignNumber(number);
                                                                            }}
                                                                            title={!editPhoneNumberPermission ? 'You do not have permission to unassign phone numbers' : 'Unassign user'}
                                                                        >
                                                                            {isUnassigning && selectedNumberId === number.id ? <Loader size={14} color="orange" /> : <UserRoundX size={14} />}
                                                                        </ActionIcon>
                                                                    ) : (
                                                                        <ActionIcon
                                                                            size="sm"
                                                                            variant="light"
                                                                            color="blue"
                                                                            onClick={() => handleAssignNumber(number)}
                                                                            title={!editPhoneNumberPermission ? 'You do not have permission to assign phone numbers' : 'Assign to user'}
                                                                            disabled={!editPhoneNumberPermission}
                                                                        >
                                                                            <User size={14} />
                                                                        </ActionIcon>
                                                                    )}

                                                                    <ActionIcon
                                                                        disabled={!!Number(number?.userId + '') || !editPhoneNumberPermission}
                                                                        size="sm"
                                                                        variant="light"
                                                                        color="red"
                                                                        onClick={() => handleDeleteNumber(number)}
                                                                        title={!editPhoneNumberPermission ? 'You do not have permission to delete phone numbers' : 'Delete number'}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </ActionIcon>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                        {filteredNumbers.length === 0 && numbers.length > 0 && (
                                            <div className="text-center py-8">
                                                <Text color="dimmed">No phone numbers match your search criteria</Text>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Tabs.Panel>

                            <Tabs.Panel value="analytics" className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="p-2">
                                        <Text size="sm" color="dimmed">
                                            Total Numbers
                                        </Text>
                                        <Text size="xl" weight={600}>
                                            {numbers.length}
                                        </Text>
                                    </Card>

                                    <Card className="p-2">
                                        <Text size="sm" color="dimmed">
                                            Assigned Numbers
                                        </Text>
                                        <Text size="xl" weight={600}>
                                            {numbers.filter((n) => n.userId).length}
                                        </Text>
                                    </Card>
                                </div>

                                {numbers.length === 0 && (
                                    <div className="text-center py-8">
                                        <Text color="dimmed">Purchase phone numbers to see analytics</Text>
                                    </div>
                                )}
                            </Tabs.Panel>
                            <Tabs.Panel value="messagingService" className="pt-4">
                                <div>
                                    {user?.company?.messaging_service ? (
                                        <Text weight={600} className="mb-1">
                                            {user?.company?.messaging_service?.friendlyName || 'Unknown Campaign'}
                                        </Text>
                                    ) : (
                                        <div>
                                            <FormLabel>Messaging Service</FormLabel>
                                            <Select
                                                className="w-1/2"
                                                placeholder="Messaging Services"
                                                data={
                                                    services?.services.map((s) => ({
                                                        value: s.sid,
                                                        label: s.friendlyName,
                                                    })) || []
                                                }
                                                value={messagingService}
                                                onChange={(value) => {
                                                    setMessagingService(value || 'all');
                                                    setCampaignId('all');
                                                }}
                                            />
                                        </div>
                                    )}

                                    {Array.isArray(campaigns?.campaigns) && campaigns?.campaigns?.length === 0 && (
                                        <div className="text-center italic text-xs text-gray-500 pt-10">No campaigns found against this messaging service.</div>
                                    )}

                                    {user?.company?.messaging_service ? (
                                        <Card className="cursor-pointer rounded p-4 transition-all mt-3 bg-violet-100 border-violet-400 shadow-md">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Text weight={600} className="mb-1">
                                                        {user?.company?.messaging_service?.useCase || 'Unknown Campaign'}
                                                    </Text>

                                                    <Text size="sm" color="dimmed">
                                                        <span className="font-medium">External Campaign ID:</span> {user?.company?.messaging_service?.campaignSid || 'N/A'}
                                                    </Text>

                                                    <Text size="xs" color="dimmed">
                                                        <span className="font-medium">Campaign Description:</span> {user?.company?.messaging_service?.campaignDescription || 'N/A'}
                                                    </Text>

                                                    <Text size="sm" color="dimmed">
                                                        <span className="font-medium">Status:</span>
                                                        <Badge size="sm" className="mx-2" color={user?.company?.messaging_service?.campaignStatus === 'active' ? 'green' : 'yellow'}>
                                                            {user?.company?.messaging_service?.campaignStatus}
                                                        </Badge>
                                                    </Text>

                                                    {user?.company?.messaging_service?.campaignDateCreated && (
                                                        <Text size="sm" color="dimmed">
                                                            <span className="font-medium">Created:</span> {new Date(user?.company?.messaging_service.campaignDateCreated).toLocaleDateString()}
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ) : (
                                        <>
                                            {campaigns?.campaigns?.map((camp) => {
                                                const isSelected = selectedCampaign === camp.externalCampaignId;

                                                return (
                                                    <Card
                                                        key={camp.externalCampaignId}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedCampaign('all');
                                                                setCampaignId('all');
                                                            } else {
                                                                setSelectedCampaign(camp.externalCampaignId);
                                                                setCampaignId(camp.externalCampaignId);
                                                            }
                                                        }}
                                                        className={`cursor-pointer rounded p-4 transition-all mt-3 ${
                                                            isSelected ? 'bg-violet-100 border-violet-400 shadow-md' : 'bg-white border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <Text weight={600} className="mb-1">
                                                                    {camp.useCase || 'Unknown Campaign'}
                                                                </Text>

                                                                <Text size="sm" color="dimmed">
                                                                    <span className="font-medium">External Campaign ID:</span> {camp.externalCampaignId || 'N/A'}
                                                                </Text>

                                                                <Text size="xs" color="dimmed">
                                                                    <span className="font-medium">Campaign Description:</span> {camp.description || 'N/A'}
                                                                </Text>

                                                                <Text size="sm" color="dimmed">
                                                                    <span className="font-medium">Status:</span>
                                                                    <Badge size="sm" className="mx-2" color={camp.status === 'active' ? 'green' : 'yellow'}>
                                                                        {camp.status}
                                                                    </Badge>
                                                                </Text>

                                                                {camp.dateCreated && (
                                                                    <Text size="sm" color="dimmed">
                                                                        <span className="font-medium">Created:</span> {new Date(camp.dateCreated).toLocaleDateString()}
                                                                    </Text>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </>
                                    )}

                                    {user?.company?.messaging_service ? null : (
                                        <Button variant="filled" color="violet" onClick={handleCreate} className="mt-7" disabled={isLoading || messagingService === 'all' || campaignId === 'all'}>
                                            {isLoading ? 'Connecting...' : 'Connect'}
                                        </Button>
                                    )}
                                </div>
                            </Tabs.Panel>

                            <Tabs.Panel value="settings" className="pt-4">
                                {/* SubAccount Info */}
                                <Card className="bg-violet-50 border-violet-200 p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Text weight={600} className="mb-1">
                                                {socialsData?.socails?.twilio?.friendlyName || 'New SubAccount'}
                                            </Text>
                                            <Text size="sm" color="dimmed">
                                                SID: {socialsData?.socails?.twilio?.accountSid || 'N/A'}
                                            </Text>
                                            <Text size="sm" color="dimmed">
                                                Status:{' '}
                                                <Badge size="sm" color={socialsData?.socails?.twilio?.status === 'active' ? 'green' : 'yellow'}>
                                                    {socialsData?.socails?.twilio?.status}
                                                </Badge>
                                            </Text>
                                            {socialsData?.socails?.twilio?.created_at && (
                                                <Text size="sm" color="dimmed">
                                                    Created: {new Date(socialsData?.socails?.twilio?.created_at).toLocaleDateString()}
                                                </Text>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <Text size="sm" color="dimmed">
                                                Total Numbers
                                            </Text>
                                            <Text weight={600} size="lg">
                                                {numbers.length}
                                            </Text>
                                        </div>
                                    </div>
                                </Card>
                            </Tabs.Panel>
                        </Tabs>

                        <div className="flex justify-end">
                            <Button variant="outline" color="violet" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const { data: socialsData, isFetching } = useGetIntegrationsQuery();
    const phoneNumber = useMemo(() => socialsData?.socails?.twilioPhoneNumber?.phoneNumber, [socialsData]);

    useEffect(() => {
        if (socialsData?.socails?.twilio && opened) {
            setFriendlyName(socialsData.socails.twilio.friendlyName || '');

            if (socialsData.socails.twilio.friendlyName) {
                if (step == 2) return;
                setStep(3); // If subaccount exists but no phone number, go to confirm purchase step
            } else {
                setStep(1); // If no data, start from step 1
            }
        }
    }, [socialsData?.socails?.twilio, opened, phoneNumber]);

    return (
        <>
            <Modal
                size={step > 2 ? 'max-w-2xl' : 'max-w-2xl'}
                isOpen={opened && !purchaseModalOpen && !assignModalOpen && !deleteModalOpen}
                close={() => {
                    resetState();
                    onClose();
                }}
            >
                <ModalHeader title="Twilio Integration" />
                <ModalBody>
                    <>{renderStepContent()}</>
                </ModalBody>
            </Modal>
            {purchaseModalOpen && (
                <PurchaseNumbersModal
                    opened={purchaseModalOpen}
                    onClose={() => {
                        setPurchaseModalOpen(false);
                    }}
                    subAccount={{
                        sid: socialsData?.socails?.twilio?.accountSid || '',
                        friendlyName: socialsData?.socails?.twilio?.friendlyName || '',
                    }}
                />
            )}

            {assignModalOpen && (
                <AssignNumberModal
                    opened={assignModalOpen}
                    onClose={() => {
                        setAssignModalOpen(false);
                    }}
                    number={selectedNumber}
                    users={unregisteredTwilioPhoneNumberUsers}
                />
            )}
            {deleteModalOpen && selectedNumber?.id && (
                <DeleteNumberModal
                    close={() => {
                        // setSelectedNumber(null);
                        setDeleteModalOpen(false);
                    }}
                    phoneNumberId={selectedNumber?.id + ''}
                    opened={deleteModalOpen}
                />
            )}
        </>
    );
}
