import { Box, LoadingOverlay } from '@mantine/core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IAddLeadListRequest, ILeadList } from '../../models/leadsList';
import FormGroup from '../../../../../shared/components/forms/FormGroup';
import FormLabel from '../../../../../shared/components/forms/FormLabel';
import FormInput from '../../../../../shared/components/forms/FormInput';
import FormFeedback from '../../../../../shared/components/forms/FormFeedback';

interface ILeadsFormProps {
    close: () => void;
    data: ILeadList;
    fetching?: boolean;
    edit?: (formData: IAddLeadListRequest, leadId: number) => Promise<void>;
    add?: (formData: IAddLeadListRequest) => Promise<void>;
}

function LeadsForm({ close, data, fetching, edit, add }: ILeadsFormProps) {
    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: data?.name || '',
            description: data?.description || '',
        },
        validationSchema: Yup.object({
            name: Yup.string().max(100).required('Name is required'),
            description: Yup.string().max(500).nullable(),
        }),
        onSubmit: async (values) => {
            const formData: IAddLeadListRequest = {
                ...values,
            };

            if (edit) await edit(formData, data.id);
            else if (add) await add(formData);

            validation.setSubmitting(false);
        },
    });

    return (
        <Box pos="relative" className="">
            <LoadingOverlay visible={validation.isSubmitting || !!fetching} zIndex={1000} overlayBlur={1} />
            <form className="!font-nunito space-y-6" onSubmit={validation.handleSubmit}>
                {/* Name */}
                <FormGroup>
                    <FormLabel required htmlFor="name">
                        Name
                    </FormLabel>
                    <FormInput {...validation.getFieldProps('name')} placeholder="Enter name" className="focus:ring-2 focus:ring-blue-500" />
                    <FormFeedback error={validation.errors.name} />
                </FormGroup>

                {/* Description */}
                <FormGroup>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormInput {...validation.getFieldProps('description')} placeholder="Enter description" className="focus:ring-2 focus:ring-blue-500" />
                    <FormFeedback error={validation.errors.description} />
                </FormGroup>

                {/* Buttons */}
                <div className="flex justify-end items-center space-x-4">
                    <button type="button" className="px-6 py-2 bg-BG border-BG  shadow-none  rounded-lg  transition" onClick={close}>
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
