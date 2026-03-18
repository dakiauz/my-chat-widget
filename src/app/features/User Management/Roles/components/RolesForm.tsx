import { Box, LoadingOverlay } from '@mantine/core';
import { useFormik } from 'formik';
import { Briefcase, ClipboardList, Shield, Type, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import IconCheck from '../../../../../_theme/components/Icon/IconCheck';
import FormFeedback from '../../../../shared/components/forms/FormFeedback';
import FormGroup from '../../../../shared/components/forms/FormGroup';
import FormLabel from '../../../../shared/components/forms/FormLabel';
import { IAddRolePayload, IPermission, IRolesFormData } from '../models/roles';
import { useGetPermissionsQuery } from '../services/rolesApi';
import FormInput from '../../../../shared/components/forms/FormInput';

interface IEditBodyProps {
    close: () => void;
    edit?: (formdata: IAddRolePayload, userId: number) => Promise<void>;
    add?: (formdata: IAddRolePayload) => Promise<void>;
    data: IRolesFormData;
    permissions: any;
}

function RolesForm({ close, edit, add, data }: IEditBodyProps) {
    const [permissionsState, setPermissionsState] = useState<IPermission[]>([]);

    // Fetch permissions using RTK Query
    const { data: permissionsData, isLoading, error } = useGetPermissionsQuery();

    useEffect(() => {
        if (permissionsData?.data?.permissions) {
            setPermissionsState(permissionsData.data.permissions);
        }
    }, [permissionsData]);

    const options = useMemo(() => {
        if (!permissionsState.length) return [];
        return permissionsState.map((permission) => ({
            value: permission?.id?.toString() || '',
            label: permission?.name || 'Unknown',
        }));
    }, [permissionsState]);

    const validation = useFormik({
        validateOnBlur: false,
        enableReinitialize: true,
        initialValues: {
            name: data.name || '',
            description: data.description || '',
            permissions: Array.isArray(data.permissions) ? data.permissions.map(String) : [],
        },
        validationSchema: Yup.object({
            name: Yup.string().max(100, 'Name must be less than 100 characters').required('Name is required'),
            description: Yup.string().max(500, 'Description must be less than 500 characters').required('Description is required'),
            permissions: Yup.array().min(1, 'At least one permission is required').required('Permissions are required'),
        }),
        validateOnChange: true,
        onSubmit: async (values) => {
            const formData: IAddRolePayload = {
                name: values.name,
                description: values.description,
                permissions: values.permissions.map((val) => parseInt(val, 10)),
            };

            if (edit) {
                await edit(formData, data.id);
            } else if (add) {
                await add(formData);
            }
            validation.setSubmitting(false);
        },
    });

    const featureSections = useMemo(() => {
        if (!permissionsState) return [];
        let uniquePermissions = [...new Set(permissionsState.map((permission) => permission.name.split(' ').slice(1).join(' ')))];
        return uniquePermissions.map((section) => {
            const sectionPermissions = permissionsState.filter((permission) => permission.name.split(' ').slice(1).join(' ') == section);
            return {
                label: section,
                icon: getFeatureSectionIcon(section),
                permissions: sectionPermissions.map((permission) => ({
                    value: permission.id.toString(),
                    label: permission.name,
                })),
            };
        });
    }, [permissionsState]);

    return (
        <Box pos="relative" p={6}>
            <LoadingOverlay visible={validation.isSubmitting || isLoading} zIndex={1000} overlayBlur={1} />

            {error && <p className="text-red-500">Failed to load permissions</p>}

            <form className="!font-nunito" onSubmit={validation.handleSubmit}>
                {/* Name Field */}
                <FormGroup>
                    <FormLabel required htmlFor="userName">
                        Name
                    </FormLabel>
                    <FormInput value={validation.values.name} onChange={validation.handleChange} onBlur={validation.handleBlur} id="userName" name="name" placeholder="Enter role name" />
                    <FormFeedback error={validation.touched.name && validation.errors.name} />
                </FormGroup>

                {/* Description Field */}
                <FormGroup>
                    <FormLabel required htmlFor="description">
                        Description
                    </FormLabel>
                    <FormInput
                        value={validation.values.description}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        id="description"
                        name="description"
                        placeholder="Enter role description"
                    />
                    <FormFeedback error={validation.touched.description && validation.errors.description} />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="permissions" className="mb-4">
                        Permissions
                    </FormLabel>
                    {featureSections.map((section) => (
                        <div key={section.label} className="mb-4">
                            <div className="grid grid-cols-12">
                                <div className="text-sm font-semibold flex items-center mb-4 col-span-3">
                                    <section.icon className="inline-block w-5 h-5 text-blue-500" />
                                    <div className="flex flex-col ml-2">
                                        <h4 className="text-sm font-bold">{section.label}</h4>
                                        <p className="text-gray text-xs mb-2">Manage {section.label.toLowerCase()}</p>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-2 justify-end flex-wrap col-span-9">
                                    {section.permissions.map((option) => {
                                        const isSelected = validation.values.permissions.includes(option.value);

                                        const manualRecordingId = permissionsState.find((p) => p.name === 'Manual Recording')?.id?.toString() ?? '';

                                        const autoRecordingId = permissionsState.find((p) => p.name === 'Auto Recording')?.id?.toString() ?? '';

                                        const manualSelected = validation.values.permissions.includes(manualRecordingId);
                                        const autoSelected = validation.values.permissions.includes(autoRecordingId);

                                        const isDisabled = (option.value === manualRecordingId && autoSelected) || (option.value === autoRecordingId && manualSelected);

                                        return (
                                            <label key={option.value} className="cursor-pointer flex flex-grow">
                                                <div
                                                    onClick={() => {
                                                        if (isDisabled) return;

                                                        const newPermissions = isSelected
                                                            ? validation.values.permissions.filter((id) => id !== option.value)
                                                            : [...validation.values.permissions, option.value];
                                                        validation.setFieldValue('permissions', newPermissions);
                                                    }}
                                                    className={`
                    min-w-[100px] max-w-[120px] sm:max-w-full flex-grow h-max py-2 text-xsm border rounded-lg transition flex items-center justify-center gap-2
                    ${isSelected ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                                                >
                                                    {isSelected && <IconCheck className="text-blue-500 w-4 h-4" />}
                                                    {option.label.split(' ')[0]}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </FormGroup>

                {/* Buttons */}
                <div className="flex justify-end items-center mt-8 gap-4">
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

export default RolesForm;

export const getFeatureSectionIcon = (section: string) => {
    switch (section) {
        case 'Users':
            return Users;
        case 'Role':
            return Shield;
        case 'Lead List':
            return Type;
        case 'Lead':
            return Briefcase;
        case 'Task':
            return ClipboardList;
        default:
            return Users;
    }
};
