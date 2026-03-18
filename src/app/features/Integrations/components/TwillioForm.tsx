'use client';

import type React from 'react';
import { useState } from 'react';
import { Button, Select, Checkbox, Group, Stack, Text, Alert, Progress, Badge, Paper, ThemeIcon, List, Code } from '@mantine/core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showMessage } from '../../../shared/utils/utils';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import ModalHeader from '../../../shared/components/ui/modals/modal/ModalHeader';
import FormInput from '../../../shared/components/forms/FormInput';
import IconInfoCircle from '../../../../_theme/components/Icon/IconInfoCircle';
import { AlertCircle, Check } from 'lucide-react';

interface TwilioA2PRegistrationModalProps {
    opened: boolean;
    onClose: () => void;
}

interface StepResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// Validation schemas for each step
const stepValidationSchemas = [
    // Step 1: Customer Profile
    Yup.object({
        customerName: Yup.string().min(2, 'Customer name is required').required('Required'),
        friendlyName: Yup.string().min(2, 'Friendly name is required').required('Required'),
        email: Yup.string().email('Valid email is required').required('Required'),
        statusCallback: Yup.string().url('Must be a valid URL').optional(),
    }),

    // Step 2: Business Information
    Yup.object({
        businessName: Yup.string().min(2, 'Business name is required').required('Required'),
        businessWebsite: Yup.string().url('Valid website URL is required').required('Required'),
        businessType: Yup.string().required('Required'),
        businessIndustry: Yup.string().required('Required'),
        businessRegionsOfOperation: Yup.string().required('Required'),
        businessIdentity: Yup.string().required('Required'),
        businessRegistrationIdentifier: Yup.string().required('Required'),
        businessRegistrationNumber: Yup.string().min(1, 'Registration number is required').required('Required'),
    }),

    // Step 3: Authorized Representative
    Yup.object({
        firstName: Yup.string().min(1, 'First name is required').required('Required'),
        lastName: Yup.string().min(1, 'Last name is required').required('Required'),
        repEmail: Yup.string().email('Valid email is required').required('Required'),
        phoneNumber: Yup.string().min(10, 'Valid phone number is required').required('Required'),
        jobPosition: Yup.string().min(1, 'Job position is required').required('Required'),
    }),

    // Step 4: Business Address
    Yup.object({
        addressCustomerName: Yup.string().min(2, 'Customer name is required').required('Required'),
        street: Yup.string().min(2, 'Street address is required').required('Required'),
        city: Yup.string().min(2, 'City is required').required('Required'),
        region: Yup.string().min(1, 'State/Region is required').required('Required'),
        postalCode: Yup.string().min(5, 'Postal code is required').required('Required'),
        isoCountry: Yup.string().length(2, 'Country code must be 2 characters').required('Required'),
    }),

    // Step 5: Trust Product
    Yup.object({
        trustProductFriendlyName: Yup.string().min(2, 'Friendly name is required').required('Required'),
        trustProductEmail: Yup.string().email('Valid email is required').required('Required'),
        companyType: Yup.string().required('Required'),
        stockExchange: Yup.string().when('companyType', {
            is: 'public',
            then: (schema) => schema.required('Stock exchange is required for public companies'),
            otherwise: (schema) => schema.optional(),
        }),
        stockTicker: Yup.string().when('companyType', {
            is: 'public',
            then: (schema) => schema.required('Stock ticker is required for public companies'),
            otherwise: (schema) => schema.optional(),
        }),
    }),

    // Step 6: Brand Registration
    Yup.object({
        skipSecondaryVetting: Yup.boolean(),
    }),
];

const businessTypes = [
    { value: 'PRIVATE_PROFIT', label: 'Private For-Profit' },
    { value: 'PUBLIC_PROFIT', label: 'Public For-Profit' },
    { value: 'NON_PROFIT', label: 'Non-Profit' },
    { value: 'GOVERNMENT', label: 'Government' },
];

const businessIndustries = [
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'OTHER', label: 'Other' },
];

const stepTitles = ['Customer Profile', 'Business Information', 'Authorized Representative', 'Business Address', 'Trust Product', 'Brand Registration'];

// Mock API functions for each step
const createCustomerProfile = async (data: any): Promise<StepResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        data: {
            customerProfileSid: `CP${Math.random().toString(36).substr(2, 9)}`,
            ...data,
        },
    };
};

const createEndUser = async (data: any, customerProfileSid: string): Promise<StepResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        data: {
            endUserSid: `EU${Math.random().toString(36).substr(2, 9)}`,
            customerProfileSid,
            ...data,
        },
    };
};

const createAuthorizedRep = async (data: any, customerProfileSid: string): Promise<StepResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        data: {
            authorizedRepSid: `AR${Math.random().toString(36).substr(2, 9)}`,
            customerProfileSid,
            ...data,
        },
    };
};

const createAddress = async (data: any, customerProfileSid: string): Promise<StepResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        data: {
            addressSid: `AD${Math.random().toString(36).substr(2, 9)}`,
            customerProfileSid,
            ...data,
        },
    };
};

const createTrustProduct = async (data: any, customerProfileSid: string): Promise<StepResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        data: {
            trustProductSid: `TP${Math.random().toString(36).substr(2, 9)}`,
            customerProfileSid,
            status: 'pending-review',
            ...data,
        },
    };
};

const createBrandRegistration = async (data: any, trustProductSid: string): Promise<StepResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        data: {
            brandSid: `BN${Math.random().toString(36).substr(2, 9)}`,
            trustProductSid,
            status: 'pending',
            ...data,
        },
    };
};

export const TwilioA2PRegistrationModal: React.FC<TwilioA2PRegistrationModalProps> = ({ opened, onClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stepResponses, setStepResponses] = useState<Record<number, any>>({});
    const totalSteps = 6;

    const formik = useFormik({
        initialValues: {
            // Step 1: Customer Profile
            customerName: '',
            friendlyName: '',
            email: '',
            statusCallback: '',

            // Step 2: Business Information
            businessName: '',
            businessWebsite: '',
            businessType: 'PRIVATE_PROFIT',
            businessIndustry: 'TECHNOLOGY',
            businessRegionsOfOperation: 'US',
            businessIdentity: 'DIRECT_CUSTOMER',
            businessRegistrationIdentifier: 'EIN',
            businessRegistrationNumber: '',

            // Step 3: Authorized Representative
            firstName: '',
            lastName: '',
            repEmail: '',
            phoneNumber: '',
            jobPosition: '',

            // Step 4: Business Address
            addressCustomerName: '',
            street: '',
            streetSecondary: '',
            city: '',
            region: '',
            postalCode: '',
            isoCountry: 'US',

            // Step 5: Trust Product
            trustProductFriendlyName: '',
            trustProductEmail: '',
            companyType: 'private',
            stockExchange: '',
            stockTicker: '',

            // Step 6: Brand Registration
            skipSecondaryVetting: false,
        },
        validationSchema: stepValidationSchemas[activeStep],
        onSubmit: () => {}, // Not used since we handle submission per step
    });

    const handleStepSubmission = async () => {
        setIsSubmitting(true);

        try {
            const stepFields = getStepFields(activeStep);
            const stepData = stepFields.reduce((acc, field) => {
                acc[field] = formik.values[field as keyof typeof formik.values];
                return acc;
            }, {} as any);

            let response: StepResponse;

            switch (activeStep) {
                case 0:
                    response = await createCustomerProfile(stepData);
                    break;
                case 1:
                    response = await createEndUser(stepData, stepResponses[0]?.customerProfileSid);
                    break;
                case 2:
                    response = await createAuthorizedRep(stepData, stepResponses[0]?.customerProfileSid);
                    break;
                case 3:
                    response = await createAddress(stepData, stepResponses[0]?.customerProfileSid);
                    break;
                case 4:
                    response = await createTrustProduct(stepData, stepResponses[0]?.customerProfileSid);
                    break;
                case 5:
                    response = await createBrandRegistration(stepData, stepResponses[4]?.trustProductSid);
                    break;
                default:
                    throw new Error('Invalid step');
            }

            if (response.success) {
                // Store the response for this step
                setStepResponses((prev) => ({
                    ...prev,
                    [activeStep]: response.data,
                }));

                showMessage(`Successfully created ${stepTitles[activeStep].toLowerCase()}`, 'success');

                // Move to next step or complete
                if (activeStep < totalSteps - 1) {
                    setActiveStep(activeStep + 1);
                    formik.resetForm({
                        values: formik.values,
                    });
                    formik.validateForm(stepValidationSchemas[activeStep + 1].cast(formik.values) as typeof formik.values);
                } else {
                    // Final step completed
                    showMessage('Your A2P 10DLC brand registration has been submitted successfully.', 'success');
                    onClose();
                }
            } else {
                throw new Error(response.error || 'API call failed');
            }
        } catch (error) {
            showMessage(`Failed to create ${stepTitles[activeStep].toLowerCase()}. Please try again.`, 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        const isValid = await formik.validateForm();
        const stepFields = getStepFields(activeStep);
        const stepErrors = Object.keys(isValid).filter((key) => stepFields.includes(key) && isValid[key as keyof typeof isValid]);

        if (stepErrors.length === 0) {
            await handleStepSubmission();
        } else {
            const touchedFields = stepFields.reduce((acc, field) => {
                acc[field] = true;
                return acc;
            }, {} as any);
            formik.setTouched(touchedFields);
        }
    };

    const prevStep = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
            formik.validateForm(stepValidationSchemas[activeStep - 1].cast(formik.values) as typeof formik.values);
        }
    };

    const getStepFields = (step: number): string[] => {
        switch (step) {
            case 0:
                return ['customerName', 'friendlyName', 'email', 'statusCallback'];
            case 1:
                return [
                    'businessName',
                    'businessWebsite',
                    'businessType',
                    'businessIndustry',
                    'businessRegionsOfOperation',
                    'businessIdentity',
                    'businessRegistrationIdentifier',
                    'businessRegistrationNumber',
                ];
            case 2:
                return ['firstName', 'lastName', 'repEmail', 'phoneNumber', 'jobPosition'];
            case 3:
                return ['addressCustomerName', 'street', 'city', 'region', 'postalCode', 'isoCountry'];
            case 4:
                return ['trustProductFriendlyName', 'trustProductEmail', 'companyType', 'stockExchange', 'stockTicker'];
            case 5:
                return ['skipSecondaryVetting'];
            default:
                return [];
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Stack>
                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">Creating a Customer Profile to represent your business in Twilio's system.</h3>
                            </div>
                        </Alert>

                        <FormInput label="Customer Name" placeholder="Acme, Inc." {...formik.getFieldProps('customerName')} error={formik.touched.customerName && formik.errors.customerName} />

                        <FormInput
                            label="Friendly Name"
                            placeholder="Acme Customer Profile"
                            {...formik.getFieldProps('friendlyName')}
                            error={formik.touched.friendlyName && formik.errors.friendlyName}
                        />

                        <FormInput label="Email" placeholder="notifications@yourdomain.com" {...formik.getFieldProps('email')} error={formik.touched.email && formik.errors.email} />

                        <FormInput
                            label="Status Callback URL (Optional)"
                            placeholder="https://yourdomain.com/webhooks/status"
                            {...formik.getFieldProps('statusCallback')}
                            error={formik.touched.statusCallback && formik.errors.statusCallback}
                        />

                        {stepResponses[0] && (
                            <Alert color="green" variant="light">
                                <Group>
                                    <ThemeIcon size="sm" color="green" variant="light">
                                        <Text size="xs" fw={700}>
                                            ✓
                                        </Text>
                                    </ThemeIcon>
                                    <h3>Customer Profile created: {stepResponses[0].customerProfileSid}</h3>
                                </Group>
                            </Alert>
                        )}
                    </Stack>
                );

            case 1:
                return (
                    <Stack>
                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">Creating an End User resource with your business information.</h3>
                            </div>
                        </Alert>

                        <FormInput label="Business Name" placeholder="Acme, Inc." {...formik.getFieldProps('businessName')} error={formik.touched.businessName && formik.errors.businessName} />

                        <FormInput
                            label="Business Website"
                            placeholder="https://www.example.com"
                            {...formik.getFieldProps('businessWebsite')}
                            error={formik.touched.businessWebsite && formik.errors.businessWebsite}
                        />

                        <Group grow>
                            <Select label="Business Type" data={businessTypes} {...formik.getFieldProps('businessType')} error={formik.touched.businessType && formik.errors.businessType} />
                            <Select
                                label="Industry"
                                data={businessIndustries}
                                {...formik.getFieldProps('businessIndustry')}
                                error={formik.touched.businessIndustry && formik.errors.businessIndustry}
                            />
                        </Group>

                        <Group grow>
                            <Select
                                label="Regions"
                                data={[
                                    { value: 'US', label: 'United States' },
                                    { value: 'US_CA', label: 'US & Canada' },
                                    { value: 'GLOBAL', label: 'Global' },
                                ]}
                                {...formik.getFieldProps('businessRegionsOfOperation')}
                                error={formik.touched.businessRegionsOfOperation && formik.errors.businessRegionsOfOperation}
                            />
                            <Select
                                label="Identity"
                                data={[
                                    { value: 'DIRECT_CUSTOMER', label: 'Direct Customer' },
                                    { value: 'RESELLER', label: 'Reseller' },
                                ]}
                                {...formik.getFieldProps('businessIdentity')}
                                error={formik.touched.businessIdentity && formik.errors.businessIdentity}
                            />
                            <Select
                                label="ID Type"
                                data={[
                                    { value: 'EIN', label: 'EIN' },
                                    { value: 'DUNS', label: 'DUNS' },
                                    { value: 'OTHER', label: 'Other' },
                                ]}
                                {...formik.getFieldProps('businessRegistrationIdentifier')}
                                error={formik.touched.businessRegistrationIdentifier && formik.errors.businessRegistrationIdentifier}
                            />
                        </Group>

                        <FormInput
                            label="Registration Number"
                            placeholder="123456789"
                            {...formik.getFieldProps('businessRegistrationNumber')}
                            error={formik.touched.businessRegistrationNumber && formik.errors.businessRegistrationNumber}
                        />

                        {stepResponses[1] && (
                            <Alert color="green" variant="light">
                                <Group>
                                    <ThemeIcon size="sm" color="green" variant="light">
                                        <Text size="xs" fw={700}>
                                            ✓
                                        </Text>
                                    </ThemeIcon>
                                    <Text size="sm">End User created: {stepResponses[1].endUserSid}</Text>
                                </Group>
                            </Alert>
                        )}
                    </Stack>
                );

            case 2:
                return (
                    <Stack>
                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">Adding an authorized representative for your business.</h3>
                            </div>
                        </Alert>

                        <Group grow>
                            <FormInput label="First Name" placeholder="Jane" {...formik.getFieldProps('firstName')} error={formik.touched.firstName && formik.errors.firstName} />
                            <FormInput label="Last Name" placeholder="Doe" {...formik.getFieldProps('lastName')} error={formik.touched.lastName && formik.errors.lastName} />
                        </Group>

                        <Group grow>
                            <FormInput label="Email" placeholder="jane.doe@example.com" {...formik.getFieldProps('repEmail')} error={formik.touched.repEmail && formik.errors.repEmail} />
                            <FormInput label="Phone Number" placeholder="+12225557890" {...formik.getFieldProps('phoneNumber')} error={formik.touched.phoneNumber && formik.errors.phoneNumber} />
                        </Group>

                        <FormInput label="Job Position" placeholder="CEO" {...formik.getFieldProps('jobPosition')} error={formik.touched.jobPosition && formik.errors.jobPosition} />

                        {stepResponses[2] && (
                            <Alert color="green" variant="light">
                                <Group>
                                    <ThemeIcon size="sm" color="green" variant="light">
                                        <Text size="xs" fw={700}>
                                            ✓
                                        </Text>
                                    </ThemeIcon>
                                    <Text size="sm">Authorized Representative created: {stepResponses[2].authorizedRepSid}</Text>
                                </Group>
                            </Alert>
                        )}
                    </Stack>
                );

            case 3:
                return (
                    <Stack>
                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">Creating an address resource for your business location.</h3>
                            </div>
                        </Alert>

                        <FormInput
                            label="Customer Name"
                            placeholder="Acme, Inc."
                            {...formik.getFieldProps('addressCustomerName')}
                            error={formik.touched.addressCustomerName && formik.errors.addressCustomerName}
                        />

                        <FormInput label="Street Address" placeholder="1234 Market St" {...formik.getFieldProps('street')} error={formik.touched.street && formik.errors.street} />

                        <FormInput
                            label="Suite/Unit (Optional)"
                            placeholder="Suite 300"
                            {...formik.getFieldProps('streetSecondary')}
                            error={formik.touched.streetSecondary && formik.errors.streetSecondary}
                        />

                        <Group grow>
                            <FormInput label="City" placeholder="San Francisco" {...formik.getFieldProps('city')} error={formik.touched.city && formik.errors.city} />
                            <FormInput label="State" placeholder="CA" {...formik.getFieldProps('region')} error={formik.touched.region && formik.errors.region} style={{ flex: '0 0 100px' }} />
                            <FormInput
                                label="ZIP"
                                placeholder="94103"
                                {...formik.getFieldProps('postalCode')}
                                error={formik.touched.postalCode && formik.errors.postalCode}
                                style={{ flex: '0 0 120px' }}
                            />
                        </Group>

                        <FormInput
                            label="Country Code"
                            placeholder="US"
                            {...formik.getFieldProps('isoCountry')}
                            error={formik.touched.isoCountry && formik.errors.isoCountry}
                            style={{ maxWidth: '120px' }}
                        />

                        {stepResponses[3] && (
                            <Alert color="green" variant="light">
                                <Group>
                                    <ThemeIcon size="sm" color="green" variant="light">
                                        <Text size="xs" fw={700}>
                                            ✓
                                        </Text>
                                    </ThemeIcon>
                                    <Text size="sm">Address created: {stepResponses[3].addressSid}</Text>
                                </Group>
                            </Alert>
                        )}
                    </Stack>
                );

            case 4:
                return (
                    <Stack>
                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">Creating a Trust Product to contain additional business verification information.</h3>
                            </div>
                        </Alert>

                        <FormInput
                            label="Trust Product Name"
                            placeholder="Acme A2P Trust Product"
                            {...formik.getFieldProps('trustProductFriendlyName')}
                            error={formik.touched.trustProductFriendlyName && formik.errors.trustProductFriendlyName}
                        />

                        <FormInput
                            label="Email"
                            placeholder="notifications@yourdomain.com"
                            {...formik.getFieldProps('trustProductEmail')}
                            error={formik.touched.trustProductEmail && formik.errors.trustProductEmail}
                        />

                        <Select
                            label="Company Type"
                            data={[
                                { value: 'public', label: 'Public' },
                                { value: 'private', label: 'Private' },
                                { value: 'non_profit', label: 'Non-Profit' },
                            ]}
                            {...formik.getFieldProps('companyType')}
                            error={formik.touched.companyType && formik.errors.companyType}
                        />

                        {formik.values.companyType === 'public' && (
                            <Group grow>
                                <FormInput label="Stock Exchange" placeholder="NYSE" {...formik.getFieldProps('stockExchange')} error={formik.touched.stockExchange && formik.errors.stockExchange} />
                                <FormInput label="Stock Ticker" placeholder="ACME" {...formik.getFieldProps('stockTicker')} error={formik.touched.stockTicker && formik.errors.stockTicker} />
                            </Group>
                        )}

                        {stepResponses[4] && (
                            <Alert color="green" variant="light">
                                <Group>
                                    <ThemeIcon size="sm" color="green" variant="light">
                                        <Text size="xs" fw={700}>
                                            ✓
                                        </Text>
                                    </ThemeIcon>
                                    <Text size="sm">Trust Product created: {stepResponses[4].trustProductSid}</Text>
                                </Group>
                            </Alert>
                        )}
                    </Stack>
                );

            case 5:
                return (
                    <Stack>
                        <Alert color="yellow" variant="light">
                            <div className="flex gap-4 ">
                                <span className="text-xs text-yellow-500 px-2 py-[2px] rounded bg-yellow-200/60 h-max ">!</span>
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold">Registration Fee Required</h3>
                                    <p>Brand registration incurs fees. Standard brands: $4/month, verified brands may have additional costs.</p>
                                </div>
                            </div>
                        </Alert>

                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">Creating your brand registration for A2P 10DLC messaging.</h3>
                            </div>
                        </Alert>

                        <Checkbox
                            label="Skip Secondary Vetting (Low-Volume Only)"
                            description="Only enable for Low-Volume Standard Brands and 527 Political organizations"
                            {...formik.getFieldProps('skipSecondaryVetting')}
                            checked={formik.values.skipSecondaryVetting}
                        />

                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">Brand vetting typically takes 1-3 business days. You'll receive email updates on the registration status.</h3>
                            </div>
                        </Alert>

                        {stepResponses[5] && (
                            <Alert color="green" variant="light">
                                <Group align="flex-start">
                                    <ThemeIcon size="sm" color="green" variant="light">
                                        <Text size="xs" fw={700}>
                                            ✓
                                        </Text>
                                    </ThemeIcon>
                                    <Stack>
                                        <Text size="sm">Brand Registration created: {stepResponses[5].brandSid}</Text>
                                        <Text size="sm">Status: {stepResponses[5].status}</Text>
                                    </Stack>
                                </Group>
                            </Alert>
                        )}
                    </Stack>
                );

            default:
                return null;
        }
    };

    return (
        <Modal isOpen={opened} close={onClose}>
            <ModalHeader title="A2P SMS Messaging Registration" />
            <ModalBody>
                <Stack>
                    {/* Progress Header */}
                    <Paper p="sm" withBorder radius="md">
                        <div className="flex justify-between mb-2">
                            <h3 className="font-[500] text-ssm">{stepTitles[activeStep]}</h3>
                            <Badge color="violet" variant="light" size="sm">
                                {activeStep + 1} of {totalSteps}
                            </Badge>
                        </div>
                        <Progress color="violet" value={((activeStep + 1) / totalSteps) * 100} size="sm" />
                    </Paper>

                    {/* Step Content */}
                    <div style={{ minHeight: 350 }}>{renderStepContent()}</div>

                    {/* Navigation */}
                    <div className="flex justify-end items-center space-x-4">
                        <button
                            onClick={prevStep}
                            disabled={activeStep === 0 || isSubmitting}
                            className="px-6 py-2 bg-BG border-BG  shadow-none  rounded-lg transition disabled:opacity-50 disabled:bg-gray-200 "
                        >
                            Back
                        </button>
                        <button onClick={nextStep} disabled={isSubmitting} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition">
                            {isSubmitting ? `Creating ${stepTitles[activeStep]}...` : activeStep === totalSteps - 1 ? 'Complete Registration' : 'Continue'}
                        </button>
                    </div>
                </Stack>
            </ModalBody>
        </Modal>
    );
};

export const TwillioSubAccountAndNumberRegistrationModal: React.FC<TwilioA2PRegistrationModalProps> = ({ opened, onClose }) => {
    const SuccessDialog = (phoneNumber: string) => {
        return (
            <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="text-green-500" size={32} />
                </div>

                <Text size="xl" weight={600} className="mb-2">
                    Phone Number Purchased
                </Text>

                <Text className="text-center mb-6">You have successfully purchased the phone number {phoneNumber} for your SubAccount.</Text>

                <Button color="violet" onClick={onClose}>
                    Done
                </Button>
            </div>
        );
    };
    const TwillioConfigGuide = () => {
        return (
            <Alert icon={<AlertCircle size={16} />} color="blue" className="mb-4">
                <Text weight={500} className="mb-2">
                    Twilio Configuration Required
                </Text>
                <Text size="sm" className="mb-2">
                    To use this integration, you need to configure your Twilio credentials:
                </Text>
                <List size="sm">
                    <List.Item>
                        Get your Account SID and Auth Token from the{' '}
                        <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Twilio Console
                        </a>
                    </List.Item>
                    <List.Item>
                        Add them to your <Code>.env.local</Code> file:
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <div>TWILIO_ACCOUNT_SID=your_account_sid</div>
                            <div>TWILIO_AUTH_TOKEN=your_auth_token</div>
                        </div>
                    </List.Item>
                    <List.Item>Restart your development server</List.Item>
                </List>
            </Alert>
        );
    };
    return (
        <Modal isOpen={opened} close={onClose}>
            <ModalHeader title="Connect Twillio Account" />
            <ModalBody>
                <>
                    <Stack>
                        <Alert color="blue" variant="light">
                            <div className="flex gap-4 ">
                                <IconInfoCircle className="text-blue-500" />
                                <h3 className="text-blue-500">This feature is under development. Please check back later.</h3>
                            </div>
                        </Alert>
                    </Stack>
                    {SuccessDialog('+1234567890')}
                    {TwillioConfigGuide()}
                </>
            </ModalBody>
        </Modal>
    );
};
