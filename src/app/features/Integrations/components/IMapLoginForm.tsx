import React, { useState } from 'react';
import { Box, LoadingOverlay, Button } from '@mantine/core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IMapConnectRequest } from '../models/imap';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import FormInput from '../../../shared/components/forms/FormInput';
import FormFeedback from '../../../shared/components/forms/FormFeedback';
import { useOutlookConnectMutation } from '../services/ImapApiSlice';
import { useGmailConnectMutation } from '../services/GmailApiSlice';
import { showNotification } from '@mantine/notifications';

function IMapLoginForm({ submit, loading, close }: { submit: (formData: IMapConnectRequest) => Promise<void>; loading: boolean; close: () => void }) {
    const [provider, setProvider] = useState<'outlook' | 'gmail' | 'other' | null>(null);

    const [connectOutlook, { isLoading: isRedirectingOutlook }] = useOutlookConnectMutation();
    const [connectGmail, { isLoading: isRedirectingGmail }] = useGmailConnectMutation();

    const formik = useFormik({
        initialValues: {
            outgoing_server: '',
            incomming_server: '',
            incomming_port: undefined,
            outgoing_port: undefined,
            username: '',
            password: '',
        },
        validationSchema: Yup.object({
            outgoing_server: Yup.string().required('Outgoing server is required'),
            incomming_server: Yup.string().required('Incoming server is required'),
            incomming_port: Yup.number().min(1, 'Port must be greater than 0').required('Incoming port is required'),
            outgoing_port: Yup.number().min(1, 'Port must be greater than 0').required('Outgoing port is required'),
            username: Yup.string().required('Username is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        }),
        onSubmit: async (values) => {
            const formData = {
                outgoing_server: values.outgoing_server,
                incomming_server: values.incomming_server,
                incomming_port: values.incomming_port ?? -1,
                outgoing_port: values.outgoing_port ?? -1,
                username: values.username,
                password: values.password,
            };
            submit(formData);
        },
    });

    // Step 1: Provider selection
    if (provider === null || provider === 'outlook' || provider === 'gmail') {
        return (
            <Box className="space-y-6 p-4 pt-0">
                <div className="flex flex-col gap-4">
                    <Button
                        color="blue"
                        onClick={() => {
                            localStorage.setItem('connect', 'outlook');
                            connectOutlook()
                                .unwrap()
                                .then((response) => {
                                    setProvider('outlook');
                                    if (response.redirected_url) {
                                        window.location.href = response.redirected_url;
                                    } else {
                                        throw new Error('Failed to connect Outlook.');
                                    }
                                })
                                .catch((error) => {
                                    showNotification({
                                        title: 'Error',
                                        message: error?.message || error?.data?.message || 'Failed to connect Outlook. Please try again later.',
                                        color: 'red',
                                    });
                                    setProvider(null);
                                });
                        }}
                        loading={isRedirectingOutlook || provider === 'outlook'}
                    >
                        Connect Outlook
                    </Button>
                    <Button
                        color="red"
                        onClick={() => {
                            localStorage.setItem('connect', 'gmail');
                            connectGmail()
                                .unwrap()
                                .then((response) => {
                                    setProvider('gmail');
                                    if (response.redirected_url) {
                                        window.location.href = response.redirected_url;
                                    } else {
                                        throw new Error('Failed to connect Gmail.');
                                    }
                                })
                                .catch((error) => {
                                    showNotification({
                                        title: 'Error',
                                        message: error?.message || error?.data?.message || 'Failed to connect Gmail. Please try again later.',
                                        color: 'red',
                                    });
                                    setProvider(null);
                                });
                        }}
                        loading={isRedirectingGmail || provider === 'gmail'}
                    >
                        Connect Gmail
                    </Button>
                    <Button disabled={isRedirectingOutlook || isRedirectingGmail} color="gray" onClick={() => setProvider('other')}>
                        Connect Other Email
                    </Button>
                </div>
            </Box>
        );
    }

    // Step 2: IMAP form for other providers
    if (provider === 'other') {
        return (
            <Box pos="relative" className="">
                <LoadingOverlay visible={loading} zIndex={1000} overlayBlur={1} />
                <form className="space-y-6" onSubmit={formik.handleSubmit}>
                    {/* Outgoing Server */}
                    <FormGroup>
                        <FormLabel required htmlFor="outgoing_server">
                            Outgoing Server
                        </FormLabel>
                        <FormInput
                            {...formik.getFieldProps('outgoing_server')}
                            placeholder="Enter outgoing server"
                            className="focus:ring-2 focus:ring-blue-500"
                            invalid={formik.touched.outgoing_server && Boolean(formik.errors.outgoing_server)}
                        />
                        <FormFeedback error={formik.touched.outgoing_server && formik.errors.outgoing_server} />
                    </FormGroup>

                    {/* Incoming Server */}
                    <FormGroup>
                        <FormLabel required htmlFor="incomming_server">
                            Incoming Server
                        </FormLabel>
                        <FormInput
                            {...formik.getFieldProps('incomming_server')}
                            placeholder="Enter incoming server"
                            className="focus:ring-2 focus:ring-blue-500"
                            invalid={formik.touched.incomming_server && Boolean(formik.errors.incomming_server)}
                        />
                        <FormFeedback error={formik.touched.incomming_server && formik.errors.incomming_server} />
                    </FormGroup>

                    {/* Incoming Port */}
                    <FormGroup>
                        <FormLabel required htmlFor="incomming_port">
                            Incoming Port
                        </FormLabel>
                        <FormInput
                            {...formik.getFieldProps('incomming_port')}
                            placeholder="Enter incoming port"
                            min={1}
                            invalid={formik.touched.incomming_port && Boolean(formik.errors.incomming_port)}
                        />
                        <FormFeedback error={formik.touched.incomming_port && formik.errors.incomming_port} />
                    </FormGroup>

                    {/* Outgoing Port */}
                    <FormGroup>
                        <FormLabel required htmlFor="outgoing_port">
                            Outgoing Port
                        </FormLabel>
                        <FormInput
                            {...formik.getFieldProps('outgoing_port')}
                            placeholder="Enter outgoing port"
                            min={1}
                            invalid={formik.touched.outgoing_port && Boolean(formik.errors.outgoing_port)}
                        />
                        <FormFeedback error={formik.touched.outgoing_port && formik.errors.outgoing_port} />
                    </FormGroup>

                    {/* Username */}
                    <FormGroup>
                        <FormLabel required htmlFor="username">
                            Username
                        </FormLabel>
                        <FormInput
                            {...formik.getFieldProps('username')}
                            placeholder="Enter username"
                            className="focus:ring-2 focus:ring-blue-500"
                            invalid={formik.touched.username && Boolean(formik.errors.username)}
                        />
                        <FormFeedback error={formik.touched.username && formik.errors.username} />
                    </FormGroup>

                    {/* Password */}
                    <FormGroup>
                        <FormLabel required htmlFor="password">
                            Password
                        </FormLabel>
                        <FormInput
                            {...formik.getFieldProps('password')}
                            type="password"
                            placeholder="Enter password"
                            className="focus:ring-2 focus:ring-blue-500"
                            invalid={formik.touched.password && Boolean(formik.errors.password)}
                        />
                        <FormFeedback error={formik.touched.password && formik.errors.password} />
                    </FormGroup>

                    <div className="flex justify-end items-center space-x-4">
                        <button type="button" className="px-6 py-2 bg-BG border-BG  shadow-none  rounded-lg transition" onClick={close}>
                            Cancel
                        </button>
                        <button disabled={formik.isSubmitting || !formik.isValid || !formik.dirty} type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition">
                            Save
                        </button>
                    </div>
                </form>
            </Box>
        );
    }

    // If provider is 'outlook', we already redirected, so render nothing
    return null;
}

export default IMapLoginForm;
