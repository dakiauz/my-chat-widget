import { Box, LoadingOverlay, Select } from '@mantine/core';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { IAddLeadPayload, ILead, ILeadFormData } from '../models/lead';
import FormGroup from '../../../../shared/components/forms/FormGroup';
import FormLabel from '../../../../shared/components/forms/FormLabel';
import FormFeedback from '../../../../shared/components/forms/FormFeedback';
import FormInput from '../../../../shared/components/forms/FormInput';
import { useGetLeadStatusQuery } from '../../LeadStatus/services/leadsStatusApi';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/app/store';

interface ILeadsFormProps {
    close: () => void;
    data: ILead;
    fetching?: boolean;
    edit?: (formData: IAddLeadPayload, leadId: number) => Promise<void>;
    add?: (formData: IAddLeadPayload) => Promise<void>;
}

function LeadsForm({ close, data, fetching, edit, add }: ILeadsFormProps) {
    const { callLogData } = useSelector((state: IRootState) => state.callLogs);
    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: callLogData?.name || data?.firstName || '',
            lastName: data?.lastName || '',
            email: callLogData?.email || data?.email || '',
            phone: callLogData?.phone || data?.phone || '',
            companyName: data?.companyName || '',
            note: data?.note || '',
            websiteUrl: data?.websiteUrl || '',
            jobTitle: data?.jobTitle || '',
            socialMediaUrl: data?.socialMediaUrl || '',
            companyLinkedInUrl: data?.companyLinkedInUrl || '',
            classification: data?.classification || null,
            statusId: data?.status_id || null,
        },
        validationSchema: Yup.object({
            firstName: Yup.string().max(50).required('First name is required'),
            lastName: Yup.string().max(50),
            // .required('Last name is required'),
            email: Yup.string().email(),
            phone: Yup.string().test('is-us-ca', 'Not a United States or Canada Number', (value) => {
                // Allow empty (if allowed), but if entered, must start with +1
                if (!value) return true;
                return value.startsWith('+1');
            }),
            companyName: Yup.string().max(100),
            // .required('Company name is required'),
            websiteUrl: Yup.string(),
            // .required('Website URL is required'),
            jobTitle: Yup.string().max(100),
            // .required('Job title is required'),
            socialMediaUrl: Yup.string().url('Invalid URL'),
            // .required('Social media URL is required'),
            companyLinkedInUrl: Yup.string().url('Invalid URL'),
            // .required('Company LinkedIn URL is required'),
            classification: Yup.string().nullable(),
            // statusId: Yup.number(
            // .test('is-positive', (value) => value !== undefined && value >= 0)
            // .nullable(),
            // .required('Status is required'),
        }),
        onSubmit: async (values) => {
            const formData: IAddLeadPayload = {
                ...values,
                lead_list_id: data?.lead_list_id,
            };

            if (edit) await edit(formData, data.id);
            else if (add) await add(formData);

            validation.setSubmitting(false);
        },
    });

    const { data: leadsListStatusData, isFetching: isLeadsListFetching } = useGetLeadStatusQuery(data?.lead_list_id);

    const leadsStatusOptions = useMemo(() => {
        if (!leadsListStatusData?.data?.statuses) return [];
        let options = leadsListStatusData?.data?.statuses.map((status) => ({
            value: status.id + '',
            label: status.name,
        }));
        return options ? [...options] : [];
    }, [leadsListStatusData?.data?.statuses]);

    return (
        <Box pos="relative" className="p-6">
            <LoadingOverlay visible={validation.isSubmitting || !!fetching || !!isLeadsListFetching} zIndex={1000} overlayBlur={1} />
            <form className="!font-nunito space-y-6" onSubmit={validation.handleSubmit}>
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                        <FormLabel required htmlFor="firstName">
                            First Name
                        </FormLabel>
                        <FormInput
                            invalid={validation.touched.firstName && Boolean(validation.errors.firstName)}
                            {...validation.getFieldProps('firstName')}
                            placeholder="Enter first name"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.firstName && validation.errors.firstName} />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="lastName">Last Name</FormLabel>
                        <FormInput
                            invalid={validation.touched.lastName && Boolean(validation.errors.lastName)}
                            {...validation.getFieldProps('lastName')}
                            placeholder="Enter last name"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.lastName && validation.errors.lastName} />
                    </FormGroup>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormInput
                            invalid={validation.touched.email && Boolean(validation.errors.email)}
                            {...validation.getFieldProps('email')}
                            placeholder="Enter email"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.email && validation.errors.email} />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="phone">Phone</FormLabel>
                        <FormInput
                            invalid={validation.touched.phone && Boolean(validation.errors.phone)}
                            {...validation.getFieldProps('phone')}
                            placeholder="Enter phone number"
                            type="text"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.phone && validation.errors.phone} />
                    </FormGroup>
                </div>

                {/* Company Name & Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                        <FormLabel htmlFor="companyName">Company Name</FormLabel>
                        <FormInput
                            invalid={validation.touched.companyName && Boolean(validation.errors.companyName)}
                            {...validation.getFieldProps('companyName')}
                            placeholder="Enter company name"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.companyName && validation.errors.companyName} />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="websiteUrl">Website URL</FormLabel>
                        <FormInput
                            invalid={validation.touched.websiteUrl && Boolean(validation.errors.websiteUrl)}
                            {...validation.getFieldProps('websiteUrl')}
                            placeholder="Enter website URL"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.websiteUrl && validation.errors.websiteUrl} />
                    </FormGroup>
                </div>

                {/* Job Title & Social Media URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                        <FormLabel htmlFor="jobTitle">Job Title</FormLabel>
                        <FormInput
                            invalid={validation.touched.jobTitle && Boolean(validation.errors.jobTitle)}
                            {...validation.getFieldProps('jobTitle')}
                            placeholder="Enter job title"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.jobTitle && validation.errors.jobTitle} />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="socialMediaUrl">Social Media URL</FormLabel>
                        <FormInput
                            invalid={validation.touched.socialMediaUrl && Boolean(validation.errors.socialMediaUrl)}
                            {...validation.getFieldProps('socialMediaUrl')}
                            placeholder="Enter social media profile URL"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.socialMediaUrl && validation.errors.socialMediaUrl} />
                    </FormGroup>
                </div>

                {/* Company LinkedIn URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                        <FormLabel htmlFor="companyLinkedInUrl">Company LinkedIn URL</FormLabel>
                        <FormInput
                            invalid={validation.touched.companyLinkedInUrl && Boolean(validation.errors.companyLinkedInUrl)}
                            {...validation.getFieldProps('companyLinkedInUrl')}
                            placeholder="Enter company LinkedIn URL"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.companyLinkedInUrl && validation.errors.companyLinkedInUrl} />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel htmlFor="jobTitle">Note</FormLabel>
                        <FormInput
                            invalid={validation.touched.note && Boolean(validation.errors.note)}
                            {...validation.getFieldProps('note')}
                            placeholder="Enter note"
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                        <FormFeedback error={validation.touched.note && validation.errors.note} />
                    </FormGroup>
                </div>

                {/* Classification & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                        <FormLabel htmlFor="classification">Classification</FormLabel>
                        <Select
                            id="classification"
                            placeholder="Select classification"
                            data={[
                                { value: 'Hot', label: 'Hot' },
                                { value: 'Cold', label: 'Cold' },
                                { value: 'Warm', label: 'Warm' },
                            ]}
                            value={validation.values.classification}
                            onChange={(value) => {
                                validation.setFieldValue('classification', value);
                            }}
                            clearable
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="statusId">Status</FormLabel>
                        {/* <select id="statusId" {...validation.getFieldProps('statusId')} className="focus:ring-2 focus:ring-blue-500 border rounded-lg p-2 w-full">
                            <option value="" disabled>
                                Select a status
                            </option>
                            {leadsStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select> */}
                        <Select
                            className={validation.touched.statusId && validation.errors.statusId ? 'invalid' : ''}
                            id="statusId"
                            placeholder="Select a status"
                            data={leadsStatusOptions}
                            onChange={(value) => {
                                validation.setFieldValue('statusId', value ? +value : '');
                            }}
                            value={validation.values.statusId ? validation.values.statusId + '' : ''}
                            onBlur={validation.handleBlur('statusId')}
                            // className="focus:ring-2 focus:ring-blue-500 border rounded-lg p-2 w-full"
                            searchable
                            nothingFound="No options found"
                            clearable
                        />
                        <FormFeedback error={validation.touched.statusId && validation.errors.statusId} />
                    </FormGroup>
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-center space-x-4">
                    <button type="button" className="px-6 py-2 bg-BG border-BG  shadow-none  rounded-lg transition" onClick={close}>
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition">
                        Save
                    </button>
                </div>
            </form>
        </Box>
    );
}

export default LeadsForm;
