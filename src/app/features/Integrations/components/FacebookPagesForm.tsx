import React, { useMemo } from 'react';
import { useFacebookPageConnectMutation, useGetFacebookPagesQuery } from '../services/facebookApiSlice';
import { showNotification } from '@mantine/notifications';
import { Box, LoadingOverlay, Select } from '@mantine/core';
import * as Yup from 'yup';
import { useFormik } from 'formik';

function FacebookPagesForm({ loading }: { loading: boolean }) {
    const { data: pagesData, isFetching: pagesDataLoading } = useGetFacebookPagesQuery();
    const [connectPage, { isLoading: loadingConnectPage }] = useFacebookPageConnectMutation();

    const pages = useMemo(() => {
        if (!pagesData?.pages) return [];
        return pagesData.pages.map((page) => ({
            id: page.id,
            name: page.name,
            token: page.access_token,
        }));
    }, [pagesData]);

    const facebookPageValidation = useFormik({
        validateOnBlur: false,
        enableReinitialize: true,
        initialValues: {
            pageId: '',
            pageToken: '',
        },
        validationSchema: Yup.object({
            pageId: Yup.string().required('Page ID is required'),
            pageToken: Yup.string().required('Page Access Token is required'),
        }),
        onSubmit: async (values) => {
            await connectPage({
                pageId: values.pageId,
                pageAccessToken: values.pageToken,
            })
                .unwrap()
                .then((response) => {
                    if (response.success) {
                        showNotification({
                            title: 'Success!',
                            message: response?.message ?? 'Page connected successfully.',
                            color: 'green',
                        });
                    } else {
                        showNotification({
                            title: 'Error!',
                            message: response?.message ?? 'Failed to connect page. Please try again later.',
                            color: 'red',
                        });
                    }
                })
                .catch((error) => {
                    showNotification({
                        title: 'Error!',
                        message: 'Failed to connect page. Please try again later.',
                        color: 'red',
                    });
                });
        },
    });

    const handlePageSelect = (pageId: string) => {
        const selectedPage = pages?.find((page) => page.id === pageId);
        if (selectedPage) {
            facebookPageValidation.setFieldValue('pageId', selectedPage.id);
            facebookPageValidation.setFieldValue('pageToken', selectedPage.token);
        } else {
            showNotification({
                title: 'Error!',
                message: 'Please select a page to connect.',
                color: 'red',
            });
        }
    };
    return (
        <Box pos={'relative'}>
            <LoadingOverlay visible={pagesDataLoading || loading} zIndex={1000} overlayBlur={1} />
            <form onSubmit={facebookPageValidation.handleSubmit} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Select a Facebook Page</h2>
                <Select data={pages?.map((page) => ({ value: page.id, label: page.name })) ?? []} placeholder="Select a page" className="w-full max-w-[27.5rem]" onChange={handlePageSelect} />
                <button
                    disabled={facebookPageValidation.isSubmitting || !facebookPageValidation.values.pageId}
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {facebookPageValidation.isSubmitting ? 'Connecting...' : 'Connect Page'}
                </button>
            </form>
        </Box>
    );
}

export default FacebookPagesForm;
