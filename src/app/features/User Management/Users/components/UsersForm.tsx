import { Box, LoadingOverlay, Select, TextInput } from '@mantine/core';
import { useFormik } from 'formik';
import { useMemo } from 'react';
import * as Yup from 'yup';
import FormGroup from '../../../../shared/components/forms/FormGroup';
import FormLabel from '../../../../shared/components/forms/FormLabel';
import { IUserFormData, SubmitUserFormDataType } from '../models/user';
import FormInput from '../../../../shared/components/forms/FormInput';
import FormFeedback from '../../../../shared/components/forms/FormFeedback';

interface IEditBodyProps {
    close: () => void;
    roles: { name: string; id: number }[];
    edit?: (formdata: SubmitUserFormDataType, userId: number) => Promise<void>;
    add?: (formdata: SubmitUserFormDataType) => Promise<void>;
    data: IUserFormData;
    fetching?: boolean;
}

function UsersForm({ close, roles, edit, add, data, fetching }: IEditBodyProps) {
    const safeRoles = Array.isArray(roles) ? roles : [];
    const options = useMemo(() => safeRoles.map((role) => ({ value: role.id.toString(), label: role.name })), [safeRoles]);

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: data?.name || '',
            email: data?.email || '',
            roleId: data?.roleId === -1 ? '' : data?.roleId?.toString() || '',
            password: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().max(100).required('Name is required'),
            email: Yup.string().email().required('Email is required'),
            roleId: Yup.string().required('Role is required'),
            password: add ? Yup.string().min(8).required('Password is required') : Yup.string().nullable(),
        }),
        onSubmit: async (values) => {
            const formData: SubmitUserFormDataType = {
                name: values.name,
                email: values.email,
                roleId: parseInt(values.roleId),
                password: values.password,
            };

            if (edit) await edit(formData, data.id);
            else if (add) await add(formData);

            validation.setSubmitting(false);
        },
    });

    return (
        <Box pos="relative" className="p-6">
            <LoadingOverlay visible={validation.isSubmitting || !!fetching} zIndex={1000} overlayBlur={1} />
            <form className="!font-nunito space-y-6" onSubmit={validation.handleSubmit}>
                <FormGroup>
                    <FormLabel required htmlFor="userName">
                        Name
                    </FormLabel>
                    <FormInput
                        {...validation.getFieldProps('name')}
                        placeholder="Enter your name"
                        invalid={!!validation.errors.name && !!validation.touched.name}
                        error={validation.errors.name && validation.touched.name ? validation.errors.name : undefined}
                        className="w-full"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="userEmail">
                        Email
                    </FormLabel>
                    <FormInput
                        {...validation.getFieldProps('email')}
                        placeholder="Enter your email"
                        invalid={!!validation.errors.email && !!validation.touched.email}
                        error={validation.errors.email && validation.touched.email ? validation.errors.email : undefined}
                        className="w-full"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="userRole">
                        Role
                    </FormLabel>
                    <Select
                        data={options}
                        value={validation.values.roleId}
                        onChange={(value) => validation.setFieldValue('roleId', value)}
                        placeholder="Select a role"
                        className={`w-full ${validation.errors.roleId && validation.touched.roleId ? 'invalid' : ''}`}
                        error={
                            validation.errors.roleId && validation.touched.roleId
                                ? typeof validation.errors.roleId === 'string'
                                    ? validation.errors.roleId
                                    : Array.isArray(validation.errors.roleId)
                                    ? validation.errors.roleId.join(', ')
                                    : undefined
                                : undefined
                        }
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="userPassword">
                        Password
                    </FormLabel>
                    <FormInput
                        type="password"
                        {...validation.getFieldProps('password')}
                        placeholder="Enter a password"
                        invalid={!!validation.errors.password && !!validation.touched.password}
                        error={validation.errors.password && validation.touched.password ? validation.errors.password : undefined}
                        className="w-full"
                    />
                </FormGroup>

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

export default UsersForm;
