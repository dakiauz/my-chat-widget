import React, { useMemo, useState } from 'react';

import { useFormik } from 'formik';

import * as Yup from 'yup';

import { useDisconnectLeadGenFormMutation, useGetConnectedLeadGenFormsQuery, useGetLeadGenFormsQuery, useStoreFacebookLeadsMutation } from '../../../../Integrations/services/facebookApiSlice';

import { useGetIntegrationsQuery } from '../../../../Integrations/services/IntegrationApi';

import { IFacebookLeadgenForm } from '../../../../Integrations/models/facebook';

import Modal from '../../../../../shared/components/ui/modals/modal/Modal';

import ModalHeader from '../../../../../shared/components/ui/modals/modal/ModalHeader';

import ModalBody from '../../../../../shared/components/ui/modals/modal/ModalBody';

import { Badge, Box, Loader, LoadingOverlay, Select, Tabs, Input } from '@mantine/core';

import { showNotification } from '@mantine/notifications';

import fbImage from '../../../../Integrations/assets/fb.png';

import IconTrash from '../../../../../../_theme/components/Icon/IconTrash';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';



function FacebookLeadGenModal({ opened, close, selectedLeadList }: { opened: boolean; close: () => void; selectedLeadList: string }) {

    // --- State and RTK-Query Hooks ---
    const [disconnectLeadGenForm, { isLoading: isDisconnecting }] = useDisconnectLeadGenFormMutation();
    const { data: socialsData, isFetching: loadingIntegrations } = useGetIntegrationsQuery();
    const [selectedFormForMapping, setSelectedFormForMapping] = useState<IFacebookLeadgenForm | null>(null);
    const [facebookFields, setFacebookFields] = useState<{ id: string; content: string }[]>([]);
    const [mapping, setMapping] = useState<{ [key: string]: string }>({});
    const [leadListFields, setLeadListFields] = useState<string[]>([]);
    const [selectedLeadIdForDeletion, setSelectedLeadIdForDeletion] = useState<string | null>(null);

    // 1. New state for the single 'otherFields' string (which is NOT dynamic/custom)
    const [otherFieldsString, setOtherFieldsString] = useState<string>('');
    
    // 2. Renamed state to 'customFields' for the dynamic array of mappings
    const [customFields, setCustomFields] = useState<{ id: string, label: string, value: string }[]>([]);


    const { data: leadGenFormsData, isLoading: loadingLeadGenForm } = useGetLeadGenFormsQuery(undefined, {
        skip: !socialsData?.socails?.facebook?.fb_page_token || !socialsData?.socails?.facebook?.fb_page_id,
    });



    const { data: connectedFormsData, isFetching: loadingConnectedLeadGenForms } = useGetConnectedLeadGenFormsQuery(selectedLeadList, {
        skip: !selectedLeadList || !socialsData?.socails?.facebook?.fb_page_token || !socialsData?.socails?.facebook?.fb_page_id,
    });



    // --- Memoized values and API calls ---

    const loading = useMemo(() => loadingIntegrations || loadingLeadGenForm || loadingConnectedLeadGenForms, [loadingIntegrations, loadingLeadGenForm, loadingConnectedLeadGenForms]);



    const connectedForms = useMemo(() => {
        if (!connectedFormsData?.data) return [];
        return connectedFormsData?.data || [];
    }, [connectedFormsData]);



    const leadsForms = useMemo(() => {
        if (!leadGenFormsData?.data) return [];
        return leadGenFormsData?.data.filter((form: IFacebookLeadgenForm) => !connectedForms.some((connectedForm) => connectedForm.form_id === form.id));
    }, [leadGenFormsData, connectedForms]);



    const [connectFacebookLeadGenForm] = useStoreFacebookLeadsMutation();



    // --- Formik and Validation ---

    const storeFbValidationSchema = Yup.object().shape({});



    const storeFbFormValidation = useFormik({
        initialValues: {
            leadGenFormId: '',
        },
        validationSchema: storeFbValidationSchema,
        onSubmit: async () => {
            if (!selectedFormForMapping) return;

            const finalMapping: { [key: string]: any } = {};

            // Add hardcoded fields to the final mapping
            const hardcodedLeadListFields = [
                'firstName', 'lastName', 'email', 'phone', 'companyName',
                'websiteUrl', 'jobTitle', 'socialMediaUrl', 'companyLinkedInUrl'
            ];
            hardcodedLeadListFields.forEach((field) => {
                finalMapping[field] = mapping[field] || '';
            });

            // 3. Process the 'customFields' state (the dynamic array) and stringify the result
            const customFieldsArray = customFields
                .filter(field => field.label.trim() !== '') // Ensure fields with a label are included
                .map(field => ({
                    fieldName: field.label,
                    data: field.value
                }));
            
            // Assign the stringified array to the 'customFields' key
            finalMapping.customFields = JSON.stringify(customFieldsArray);

            // 4. Assign the single 'otherFieldsString' state to the 'otherFields' key
            if (otherFieldsString.trim() !== '') {
                finalMapping.otherFields = otherFieldsString;
            }


            const leadListIdNumber = Number(selectedLeadList);
            if (isNaN(leadListIdNumber)) {
                showNotification({
                    title: 'Error',
                    message: 'Invalid Lead List ID. Please select a valid lead list.',
                    color: 'red',
                });
                return;
            }

            try {
                const response = await connectFacebookLeadGenForm({
                    leadListId: leadListIdNumber,
                    formId: Number(selectedFormForMapping.id),
                    mapping: finalMapping,
                }).unwrap();

                if (response.success) {
                    showNotification({
                        title: 'Success',
                        message: response.message ?? 'Leads stored successfully',
                        color: 'green',
                    });
                    setSelectedFormForMapping(null);
                    setMapping({});
                    setCustomFields([]); // Clear dynamic custom fields on success
                    setOtherFieldsString(''); // Clear single other field string on success
                    close();
                }
            } catch (error: any) {
                showNotification({
                    title: 'Error',
                    message: error?.data?.message || 'Something went wrong',
                    color: 'red',
                });
            }
        },
    });



    // --- Handlers ---

    const handleDisconnectForm = (formId: string) => {
        disconnectLeadGenForm(formId)
            .unwrap()
            .then((response) => {
                if (response.success) {
                    showNotification({
                        color: 'green',
                        title: 'Disconnected',
                        message: response.message || 'Form disconnected successfully',
                    });
                }
            })
            .catch((error) => {
                showNotification({
                    title: 'Error',
                    message: error?.data?.message || 'Something went wrong',
                    color: 'red',
                });
            })
            .finally(() => {
                setSelectedLeadIdForDeletion(null);
            });
    };



    const handleSelectForm = (form: IFacebookLeadgenForm) => {
        setSelectedFormForMapping(form);
        const fbFields = form.questions.map((q: { key: any; label: any }, index: number) => ({
            id: q.key || `question-${index}`,
            content: q.label || q.key || `Question ${index + 1}`,
        }));
        setFacebookFields(fbFields);

        const hardcodedLeadListFields = ['firstName', 'lastName', 'email', 'phone', 'companyName', 'websiteUrl', 'jobTitle', 'socialMediaUrl', 'companyLinkedInUrl'];
        setLeadListFields(hardcodedLeadListFields);

        setMapping(
            hardcodedLeadListFields.reduce((acc, field) => {
                acc[field] = '';
                return acc;
            }, {} as { [key: string]: string })
        );
        setCustomFields([]); // Reset dynamic custom fields
        setOtherFieldsString(''); // Reset single other field string
    };



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
    
    // 5. Handler for the single 'otherFields' string
    const handleOtherFieldsStringChange = (newValue: string) => {
        setOtherFieldsString(newValue);
    };


    // Handlers for the dynamic 'customFields' array
    const handleAddCustomField = () => {
        const newId = `custom-${Date.now()}`;
        setCustomFields([...customFields, { id: newId, label: '', value: '' }]);
    };

    const handleRemoveCustomField = (id: string) => {
        setCustomFields(customFields.filter(field => field.id !== id));
    };

    const handleCustomFieldValueChange = (id: string, newValue: string) => {
        setCustomFields(customFields.map(field => field.id === id ? { ...field, value: newValue } : field));
    };
    
    const handleCustomFieldLabelChange = (id: string, newLabel: string) => {
        setCustomFields(customFields.map(field => field.id === id ? { ...field, label: newLabel } : field));
    };

    const handleAddCustomFieldMapping = (fieldId: string, facebookFieldId: string) => {
        const currentField = customFields.find(f => f.id === fieldId);
        if (!currentField) return;
        
        const currentMapping = currentField.value || '';
        const token = `@${facebookFieldId}`;
        const newMapping = currentMapping.length > 0 && currentMapping.slice(-1) !== ' ' ? `${currentMapping} ${token}` : `${currentMapping}${token}`;
        setCustomFields(customFields.map(field => field.id === fieldId ? { ...field, value: newMapping } : field));
    };


    // --- Render Functions ---

    const renderMappingView = () => {
        const fieldLabels: { [key: string]: string } = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            phone: 'Phone',
            companyName: 'Company Name',
            websiteUrl: 'Website URL',
            jobTitle: 'Job Title',
            socialMediaUrl: 'Social Media URL',
            companyLinkedInUrl: 'Company LinkedIn URL',
        };
        return (
            <div className="flex flex-col gap-2 bg-white">
                <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedFormForMapping(null)} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-200 text-xsm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Back to Forms
                    </button>
                    <div className="w-24"></div>
                </div>
                <div className="flex items-center justify-center flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Field Mapping for <span className="text-primary-dark bg-gray-100 px-4 rounded-md">{selectedFormForMapping?.name}</span>
                    </h3>
                    <p className="text-center text-sm text-gray-600">Map each lead list field to a Facebook field.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 p-6">
                    {/* Render hardcoded fields */}
                    {leadListFields.map((field) => (
                        <div key={field} className="flex flex-col gap-2">
                            <label className="font-semibold text-gray-700 text-sm">{fieldLabels[field] || field}</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    className="w-full"
                                    placeholder="Type a value or select a field"
                                    value={mapping[field] || ''}
                                    onChange={(e) => handleMappingChange(field, e.target.value)}
                                    classNames={{
                                        input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                    }}
                                />
                                <Select
                                    className="w-full"
                                    placeholder="Select a field"
                                    data={facebookFields.map((fbField) => ({
                                        value: fbField.id,
                                        label: fbField.content,
                                    }))}
                                    onChange={(id) => {
                                        if (id) {
                                            handleAddFieldToMapping(field, id);
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

                    {/* 6. Input for the single 'otherFields' string */}
                    <div className="flex flex-col gap-2 border-t pt-4 mt-2">
                        <label className="font-bold text-lg text-primary-dark">Other Fields</label>

                        <div className="flex items-center gap-2">
                            <Input
                                className="w-full"
                                placeholder="e.g., My name is @first_name and I live in @city"
                                value={otherFieldsString}
                                onChange={(e) => handleOtherFieldsStringChange(e.target.value)}
                                classNames={{
                                    input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                }}
                            />
                            {/* Adding a Select next to it to allow mapping tokens into the string */}
                            <Select
                                className="w-full"
                                placeholder="Insert Facebook Field"
                                data={facebookFields.map((fbField) => ({
                                    value: fbField.id,
                                    label: fbField.content,
                                }))}
                                onChange={(id) => {
                                    if (id) {
                                        const token = `@${id}`;
                                        setOtherFieldsString(prev => prev.length > 0 && prev.slice(-1) !== ' ' ? `${prev} ${token}` : `${prev}${token}`);
                                    }
                                }}
                                nothingFound="No options"
                                classNames={{
                                    input: 'bg-gray-100/70 border-none rounded-xl focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90 placeholder:text-white-dark p-5',
                                }}
                            />
                        </div>
                    </div>


                    <div className="border-t pt-4 mt-2">
                        <label className="font-bold text-lg text-primary-dark">Custom Fields</label>
                        
                    </div>
                    {/* 7. Render dynamic 'customFields' */}
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
                                        data={facebookFields.map((fbField) => ({
                                            value: fbField.id,
                                            label: fbField.content,
                                        }))}
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
                            <button
                                type="button"
                                onClick={() => handleRemoveCustomField(field.id)}
                                className="mt-7 text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
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
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => storeFbFormValidation.handleSubmit()}
                        className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md"
                        disabled={storeFbFormValidation.isSubmitting}
                    >
                        {storeFbFormValidation.isSubmitting ? <Loader size="xs" color="white" /> : 'Connect & Sync Leads'}
                    </button>
                </div>
            </div>
        );
    };



    return (
        <Modal
            isOpen={opened}
            size="max-w-3xl"
            close={() => {
                close();
                setSelectedFormForMapping(null);
                setMapping({});
                setCustomFields([]); // Clear custom fields
                setOtherFieldsString(''); // Clear other fields string
            }}
        >
            <ModalHeader title="Facebook Lead Gen Forms" />
            <ModalBody className="px-0">
                <Box pos={'relative'}>
                    <LoadingOverlay visible={loading} zIndex={1000} overlayBlur={1} />
                    <Tabs defaultValue="connectedForm">
                        <div className="px-2 sm:px-4">
                            <Tabs.List className="flex-nowrap overflow-x-auto whitespace-nowrap">
                                <Tabs.Tab value="connectedForm">Connected Forms</Tabs.Tab>
                                <Tabs.Tab value="addnewForm">Add New Form</Tabs.Tab>
                            </Tabs.List>
                        </div>
                        <div className="pl-2 sm:pl-4">
                            <Tabs.Panel value="connectedForm" pt="xs">
                                <div className="max-h-[200px] mr-2 overflow-y-auto pr-2">
                                    {connectedForms.length > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {connectedForms.map((form) => (
                                                <div key={form.id} className="flex flex-col sm:flex-row items-center justify-between border p-4 rounded-lg">
                                                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                                        <div className="text-center sm:text-left">
                                                            <p className="font-medium text-sm sm:text-base">{form.name ?? `Facebook Form ${form.id}`}</p>
                                                            {form.locale && <p className="text-xs sm:text-sm text-gray-500">Locale: {form.locale}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Badge color={form.status === 'ACTIVE' ? 'green' : 'red'}>{form.status ?? 'No Status Found'}</Badge>
                                                        <button
                                                            disabled={isDisconnecting}
                                                            className="text-red-600 hover:underline"
                                                            onClick={() => {
                                                                setSelectedLeadIdForDeletion(form.id);
                                                                handleDisconnectForm(form.id);
                                                            }}
                                                        >
                                                            {isDisconnecting && selectedLeadIdForDeletion === form.id ? <Loader size="xs" /> : <IconTrash />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 flex items-center min-h-[200px] justify-center">
                                            <p className="text-sm">No connected forms available.</p>
                                        </div>
                                    )}
                                </div>
                            </Tabs.Panel>
                            <Tabs.Panel value="addnewForm" pt="xs">
                                <div className="pr-2 sm:pr-3">
                                    {selectedFormForMapping ? (
                                        renderMappingView()
                                    ) : (
                                        <>
                                            {leadsForms.length === 0 ? (
                                                <div className="text-center text-gray-500 flex items-center min-h-[200px] justify-center">
                                                    <p className="text-sm">No forms available to connect.</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4 max-h-[200px] mr-2 overflow-y-auto">
                                                    {leadsForms?.map((form) => (
                                                        <div
                                                            key={form.id}
                                                            className="flex flex-col sm:flex-row items-center justify-between border p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50"
                                                            onClick={() => handleSelectForm(form)}
                                                        >
                                                            <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                                                <img
                                                                    src={`https://graph.facebook.com/${form.id}/picture?type=large`}
                                                                    alt={form.name}
                                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = fbImage;
                                                                    }}
                                                                />
                                                                <div className="text-center sm:text-left">
                                                                    <p className="font-semibold text-sm sm:text-lg">{form.name}</p>
                                                                    <p className="text-xs sm:text-sm text-gray-500">Locale: {form.locale}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleSelectForm(form)}
                                                                className="bg-primary text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                            >
                                                                Connect
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Tabs.Panel>
                        </div>
                    </Tabs>
                </Box>
            </ModalBody>
        </Modal>
    );
}



export default FacebookLeadGenModal;