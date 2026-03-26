import { Input, Select } from '@mantine/core';
import Modal from '../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../shared/components/ui/modals/modal/ModalBody';
import ModalHeader from '../../shared/components/ui/modals/modal/ModalHeader';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/app/store';
import { useParams } from 'react-router-dom';
import { useMappingLeadsMutation } from '../LeadManagement/Leads/services/leadsApi';
import { useDispatch } from 'react-redux';
import { clearImportFile, clearImportLeadResponse } from '@/app/slices/leadSlice';
import Swal from 'sweetalert2';
import { IconTrash } from '@tabler/icons-react';

interface ImportModalProps {
    opened: boolean;
    close: () => void;
    open: () => void;
    title: string;
}

function ImportModal({ opened, close, title, open }: ImportModalProps) {
    const dispatch = useDispatch();
    const { leadListId } = useParams();
    const { importFile, importLeadResponse } = useSelector((state: IRootState) => state.lead);
    const [mappingLeads] = useMappingLeadsMutation();
    const [customFields, setCustomFields] = useState<{ id: string; label: string; value: string }[]>([]);
    const [mapping, setMapping] = useState<{ [key: string]: string }>({});
    const handleMappingChange = (field: string, newValue: string) => {
        setMapping((prevMapping) => {
            const prevValue = prevMapping[field] || '';
            const isDeletion = prevValue.length > newValue.length;
            if (isDeletion) {
                const tokens = prevValue.match(/@\S+/g);
                if (tokens) {
                    const lastToken = tokens[tokens.length - 1];
                    if (!newValue.includes(lastToken)) {
                        const lastTokenIndex = prevValue.lastIndexOf(lastToken);
                        const newMappingValue = prevValue.slice(0, lastTokenIndex).trim();
                        return {
                            ...prevMapping,
                            [field]: newMappingValue,
                        };
                    }
                }
            }
            return {
                ...prevMapping,
                [field]: newValue,
            };
        });
    };

    const handleAddFieldToMapping = (leadListField: string, facebookFieldId: string) => {
        const currentMapping = mapping[leadListField] || '';
        const token = `@${facebookFieldId}`;
        const newMapping = currentMapping.length > 0 && currentMapping.slice(-1) !== ' ' ? `${currentMapping} ${token}` : `${currentMapping}${token}`;
        setMapping((prevMapping) => ({
            ...prevMapping,
            [leadListField]: newMapping,
        }));
    };

    const validateMapping = (): string | null => {
        return null; // Disabled mandatory Email & Phone validation
    };

    const toHumanLabel = (field: string) => {
        return field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const handleAddCustomField = () => {
        const newId = `custom-${Date.now()}`;
        setCustomFields([...customFields, { id: newId, label: '', value: '' }]);
    };

    const handleRemoveCustomField = (id: string) => {
        setCustomFields(customFields.filter((field) => field.id !== id));
    };

    const handleCustomFieldValueChange = (id: string, newValue: string) => {
        let formattedValue = newValue.trim();
        if (formattedValue && !formattedValue.startsWith('@')) {
            formattedValue = `@${formattedValue}`;
        }
        setCustomFields(customFields.map((field) => (field.id === id ? { ...field, value: formattedValue } : field)));
    };

    const handleCustomFieldLabelChange = (id: string, newLabel: string) => {
        const formattedLabel = newLabel
            .trim()
            .replace(/\s+/g, ' ') // remove extra spaces
            .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word

        setCustomFields(customFields.map((field) => (field.id === id ? { ...field, label: formattedLabel } : field)));
    };

    const handleAddCustomFieldMapping = (fieldId: string, leadListField: string) => {
        const currentField = customFields.find((f) => f.id === fieldId);
        if (!currentField) return;

        const currentMapping = currentField.value || '';
        const token = `@${leadListField}`;
        const newMapping = currentMapping.length > 0 && currentMapping.slice(-1) !== ' ' ? `${currentMapping} ${token}` : `${currentMapping}${token}`;
        setCustomFields(customFields.map((field) => (field.id === fieldId ? { ...field, value: newMapping } : field)));
    };

    const generatePayload = () => {
        const keyMapping: { [key: string]: string } = {
            firstName: 'first_name',
            lastName: 'last_name',
            email: 'mail',
            phone: 'phone',
            companyName: 'company_name',
            websiteUrl: 'website_url',
            jobTitle: 'job_title',
            socialMediaUrl: 'social_media_url',
            companyLinkedInUrl: 'company_linkedin_url',
            otherFields: 'other_fields',
        };

        const payload: { [key: string]: any } = {};

        Object.keys(keyMapping).forEach((backendKey) => {
            const mappedValue = mapping[keyMapping[backendKey]] || '';
            payload[backendKey] = mappedValue;
        });

        payload['leadsFile'] = importFile || null;

        payload['customFields'] = {};
        customFields.forEach((field) => {
            if (field.label && field.value) {
                payload['customFields'][field.label] = field.value;
            }
        });

        return payload;
    };

    const handleImportLeads = async () => {
        const errorMessage = validateMapping();
        if (errorMessage) {
            Swal.fire({
                title: 'Validation Error',
                text: errorMessage,
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }

        const formData = new FormData();
        const payload = generatePayload();

        Object.keys(payload).forEach((key) => {
            const value = payload[key];

            if (key === 'customFields') {
                Object.entries(value).forEach(([label, val]) => {
                    formData.append(`customFields[${label}]`, val as string);
                });
            } else if (key === 'leadsFile' && value) {
                formData.append(key, value); // append File object
            } else {
                formData.append(key, value ?? '');
            }
        });

        try {
            await mappingLeads({ id: leadListId, formData }).unwrap();
            dispatch(clearImportLeadResponse());
            dispatch(clearImportFile());
            setMapping({});
            close();
        } catch (err: any) {
            const message = err?.data?.message || err?.message || 'Data import failed';

            Swal.fire({
                title: 'Error',
                text: message,
                icon: 'error',
                confirmButtonText: 'OK',
                timerProgressBar: true,
                timer: 3000,
            });
        }
    };

    const fieldLabels = [
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'mail', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'company_name', label: 'Company Name' },
        { key: 'job_title', label: 'Job Title' },
        { key: 'website_url', label: 'Website URL' },
        { key: 'social_media_url', label: 'Social Media URL' },
        { key: 'company_linkedin_url', label: 'Company LinkedIn URL' },
        { key: 'other_fields', label: 'Other Fields' },
    ];

    return (
        <>
            <Modal isOpen={opened} close={close} size={'max-w-xl'}>
                <ModalHeader title={`Import ${title} Data`} />
                <ModalBody>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center flex-col">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">Field Mapping for Leads List</h3>
                            <p className="text-center text-sm text-gray-600">Map each lead list field </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Render hardcoded fields */}

                            {fieldLabels.map(({ key, label }) => (
                                <div key={key} className="flex flex-col gap-2">
                                    <label className="font-semibold text-gray-700 text-sm">
                                        {label}
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            className="w-full"
                                            placeholder="Type or select a field"
                                            value={mapping[key] || ''}
                                            required={false}
                                            onChange={(e) => handleMappingChange(key, e.target.value)}
                                            classNames={{
                                                input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                            }}
                                        />

                                        <Select
                                            className="w-full"
                                            placeholder="Select a field"
                                            data={
                                                importLeadResponse?.file_headers?.map((field: string) => ({
                                                    value: field,
                                                    label: toHumanLabel(field),
                                                })) || []
                                            }
                                            onChange={(value) => {
                                                if (value) {
                                                    handleAddFieldToMapping(key, value);
                                                }
                                            }}
                                            nothingFound="No options"
                                            classNames={{
                                                input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 mt-2">
                            <label className="font-bold text-lg text-primary-dark">Custom Fields</label>
                        </div>
                        {customFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <div className="flex-1 flex flex-col gap-2">
                                    <label className="font-semibold text-gray-700 text-sm">Custom Field {index + 1}</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            className="w-full"
                                            placeholder="Enter a custom field name (e.g., 'user_id')"
                                            value={field.label}
                                            onChange={(e) => handleCustomFieldLabelChange(field.id, e.target.value)}
                                            classNames={{
                                                input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                            }}
                                        />
                                        <Input
                                            className="w-full"
                                            placeholder="Type a value or select a field"
                                            value={field.value}
                                            onChange={(e) => handleCustomFieldValueChange(field.id, e.target.value)}
                                            classNames={{
                                                input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                            }}
                                        />
                                        <Select
                                            className="w-full"
                                            placeholder="Select a field"
                                            data={
                                                importLeadResponse?.file_headers?.map((field: string) => ({
                                                    value: field,
                                                    label: toHumanLabel(field),
                                                })) || []
                                            }
                                            onChange={(id) => {
                                                if (id) {
                                                    handleAddCustomFieldMapping(field.id, id);
                                                }
                                            }}
                                            nothingFound="No options"
                                            classNames={{
                                                input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                            }}
                                        />
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleRemoveCustomField(field.id)} className="mt-7 text-red-600 hover:text-red-800 transition-colors duration-200">
                                    <IconTrash />
                                </button>
                            </div>
                        ))}
                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={handleAddCustomField}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-300 transition-all duration-300"
                            >
                                + Add Custom Field
                            </button>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleImportLeads}
                                className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md"
                            >
                                Import Leads
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
}

export default ImportModal;
