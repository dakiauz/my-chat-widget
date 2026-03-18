import { useMemo, useState } from 'react';
import { Button, Text, Select, Checkbox, Badge, Loader, Alert } from '@mantine/core';
import { Search, Phone, MessageSquare, AlertCircle, ShoppingCart } from 'lucide-react';
import { useBugTwilioPhoneNumberMutation, useGetAvailablePhoneNumbersQuery, useGetCountriesQuery } from '../services/TwillioApiSlice';
import { useDebouncedValue } from '@mantine/hooks';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import FormInput from '../../../shared/components/forms/FormInput';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import { showNotification } from '@mantine/notifications';

interface PurchaseNumbersModalProps {
    opened: boolean;
    onClose: () => void;
    subAccount: { sid: string; friendlyName: string };
}

export function PurchaseNumbersModal({ opened, onClose, subAccount }: PurchaseNumbersModalProps) {
    const [country, setCountry] = useState('US');

    const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set());
    const [areaCode, setAreaCode] = useState<number | undefined>();
    const [city, setCity] = useState<string>('');
    const [debouncedAreaCode] = useDebouncedValue(areaCode, 500);
    const [debouncedCity] = useDebouncedValue(city, 500);

    const { data: countriesData, isFetching: loadingCountries } = useGetCountriesQuery();

    const countries = useMemo(() => {
        if (!countriesData?.countries) return [];
        return (
            countriesData?.countries.map((country) => ({
                value: country.code,
                label: country.name,
            })) || []
        );
    }, [countriesData?.countries]);

    const {
        data: availableNumbersData,
        isFetching: loadingAvailableNumbers,
        error: availableNumbersError,
    } = useGetAvailablePhoneNumbersQuery(
        { country, areaCode: debouncedAreaCode, city: debouncedCity },
        {
            skip: !country || !opened || (!debouncedAreaCode && !debouncedCity),
        }
    );

    const loading = useMemo(() => {
        return loadingAvailableNumbers || loadingCountries;
    }, [loadingAvailableNumbers, loadingCountries]);

    const availableNumbers = useMemo(() => {
        if (availableNumbersError) {
            console.error('Error fetching available phone numbers:', availableNumbersError);
            return [];
        }
        if (!availableNumbersData?.availableNumbers) return [];
        return availableNumbersData?.availableNumbers || [];
    }, [availableNumbersData?.availableNumbers, loadingAvailableNumbers]);

    const handleNumberToggle = (phoneNumber: string) => {
        // const newSelected = new Set(selectedNumbers);
        const newSelected = new Set<string>();
        if (selectedNumbers.has(phoneNumber)) {
            return setSelectedNumbers(new Set());
        }
        if (newSelected.has(phoneNumber)) {
            newSelected.delete(phoneNumber);
        } else {
            newSelected.add(phoneNumber);
        }
        setSelectedNumbers(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedNumbers.size === availableNumbers.length) {
            setSelectedNumbers(new Set());
        } else {
            setSelectedNumbers(new Set(availableNumbers.map((n) => n.phoneNumber)));
        }
    };

    const [purchaseNumber, { isLoading: purchasing }] = useBugTwilioPhoneNumberMutation();

    const handlePurchase = async () => {
        if (selectedNumbers.size === 0) return;

        let phoneNumber = Array.from(selectedNumbers)[0]; // Purchase only the first selected number for simplicity
        try {
            await purchaseNumber({ phoneNumber })
                .unwrap()
                .then((response) => {
                    showNotification({
                        title: 'Success!',
                        message: response.message || 'Phone number purchased successfully.',
                        color: 'green',
                    });
                    onClose(); // Close modal after successful purchase
                });
            setSelectedNumbers(new Set()); // Clear selection after purchase
        } catch (error: any) {
            showNotification({
                title: 'Error!',
                message: error?.data?.message || error?.message || 'Failed to purchase phone number.',
                color: 'red',
            });
            console.error('Failed to purchase phone number:', error);
        }
    };

    return (
        <Modal close={onClose} isOpen={opened}>
            <ModalHeader title="Purchase Phone Numbers" />
            <ModalBody>
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <Text size="sm" color="dimmed" className="mb-1">
                            Purchasing for SubAccount:
                        </Text>
                        <Text weight={500}>{subAccount.friendlyName}</Text>
                        <Text size="sm" color="dimmed">
                            SID: {subAccount.sid}
                        </Text>
                    </div>

                    {/* Search Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select searchable label="Country" data={countries} value={country} onChange={(value) => setCountry(value || 'US')} />

                        <FormGroup className="!mb-0">
                            <FormLabel className="font-sans !text-black opacity-100">Area Code</FormLabel>
                            <FormInput
                                type="number"
                                placeholder="Enter area code (e.g. 415)"
                                value={areaCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAreaCode(e.target.value ? parseInt(e.target.value) : undefined)}
                                className=""
                                disabled={loading}
                                maxLength={5}
                            />
                        </FormGroup>

                        {/* <div className="flex items-end">
                        <Button onClick={searchNumbers} loading={loading} color="violet" className="w-full">
                            <Search size={16} /> Search Numbers
                        </Button>
                    </div> */}
                    </div>
                    <div>
                        <FormGroup className="!mb-0">
                            <FormLabel className="font-sans !text-black opacity-100">City</FormLabel>
                            <FormInput
                                type="text"
                                placeholder="Enter city (e.g. San Francisco)"
                                value={city}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                                className=""
                                disabled={loading}
                            />
                        </FormGroup>
                    </div>

                    {/* Available Numbers */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader color="violet" size="md" className="mb-4" />
                            <Text>Searching for available numbers...</Text>
                        </div>
                    ) : availableNumbers.length > 0 ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <Text weight={500}>Available Numbers ({availableNumbers.length} found)</Text>
                                {/* <Button variant="light" size="xs" onClick={handleSelectAll}>
                                    {selectedNumbers.size === availableNumbers.length ? 'Deselect All' : 'Select All'}
                                </Button> */}
                            </div>

                            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                                {availableNumbers.map((number) => (
                                    <div key={number.phoneNumber} className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${selectedNumbers.has(number.phoneNumber) ? 'bg-violet-50' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Checkbox checked={selectedNumbers.has(number.phoneNumber)} onChange={() => handleNumberToggle(number.phoneNumber)} />

                                                <div>
                                                    <Text weight={500}>{number.phoneNumber}</Text>
                                                    <Text size="xs" color="dimmed">
                                                        {number.friendlyName}
                                                    </Text>
                                                    <div className="flex gap-1 mt-1">
                                                        {number.capabilities.voice && (
                                                            <Badge size="xs" color="blue" leftSection={<Phone size={10} />}>
                                                                Voice
                                                            </Badge>
                                                        )}
                                                        {number.capabilities.sms && (
                                                            <Badge size="xs" color="green" leftSection={<MessageSquare size={10} />}>
                                                                SMS
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <img className="w-4 h-4" alt={number.isoCountry} src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${number.isoCountry}.svg`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        !loading && (
                            <div className="text-center py-8">
                                {!areaCode && !city ? (
                                    <Text color="dimmed">Enter an area code or city to find available phone numbers</Text>
                                ) : (
                                    <Text color="dimmed">No numbers found for the given criteria</Text>
                                )}
                            </div>
                        )
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" color="violet" onClick={onClose} disabled={purchasing}>
                            Cancel
                        </Button>
                        <Button onClick={handlePurchase} loading={purchasing} disabled={selectedNumbers.size === 0} color="violet">
                            <span className={'flex items-center gap-2'}>
                                <ShoppingCart size={16} /> Purchase Number{selectedNumbers.size !== 1 ? 's' : ''}
                            </span>
                        </Button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
}
