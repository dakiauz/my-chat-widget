import { Box, LoadingOverlay, MultiSelect, Select, TextInput } from '@mantine/core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import { useGetLeadsQuery } from '../../LeadManagement/Leads/services/leadsApi';
import { ITask, ITaskFormData } from '../models/task';
import FormTextArea from '../../../shared/components/forms/FormTextArea';
import FormInput from '../../../shared/components/forms/FormInput';

interface ITasksFormProps {
    close: () => void;
    data: ITask;
    fetching?: boolean;
    leads: { value: string; label: string }[];
    selectedLeads: { value: string; label: string }[];
    edit?: (formData: ITaskFormData, taskId: number) => Promise<void>;
    add?: (formData: ITaskFormData) => Promise<void>;
}

function TasksForm({ close, data, fetching, edit, add }: ITasksFormProps) {
    const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery();

    const leadOptions =
        leadsData?.data?.leads?.map((lead: any) => ({
            value: lead.id.toString(),
            label: `${lead.firstName} ${lead.lastName ?? ''}`,
        })) || [];

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            leads: data?.leads ? data?.leads.map((lead: any) => lead.id.toString()) : [], // Pre-select leads by their ID
            title: data?.title || '',
            description: data?.description || '',
            status: data?.status || 'TODO',
            priority: data?.priority || 'MEDIUM',
            dueDate: data?.dueDate || '',
        },
        validationSchema: Yup.object({
            leads: Yup.array().min(1, 'At least one lead is required').required('Leads are required'),
            title: Yup.string().max(100).required('Title is required'),
            description: Yup.string().max(500).required('Description is required'),
            status: Yup.string().oneOf(['TODO', 'IN_PROGRESS', 'COMPLETED']).required('Status is required'),
            priority: Yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).required('Priority is required'),
            dueDate: Yup.date()
                .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Due date must be a future date')
                .required('Due date is required'),
        }),
        onSubmit: async (values) => {
            const formData: ITaskFormData = {
                ...values,
                id: 0,
            };

            if (edit) await edit(formData, data.id);
            else if (add) await add(formData);

            validation.setSubmitting(false);
        },
    });

    return (
        <Box pos="relative" className="">
            <LoadingOverlay visible={validation.isSubmitting || !!fetching || leadsLoading} zIndex={1000} overlayBlur={1} />
            <form className="!font-nunito space-y-6" onSubmit={validation.handleSubmit}>
                {/* Leads & Title on the same row */}
                <FormGroup>
                    <FormLabel required htmlFor="title">
                        Title
                    </FormLabel>
                    <FormInput
                        {...validation.getFieldProps('title')}
                        placeholder="Enter task title"
                        invalid={validation.errors.title && validation.touched.title ? true : false}
                        error={validation.errors.title && validation.touched.title ? validation.errors.title : undefined}
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="status">
                        Status
                    </FormLabel>
                    <Select
                        value={validation.values.status}
                        onChange={(value) => validation.setFieldValue('status', value)}
                        data={[
                            { value: 'TODO', label: 'Todo' },
                            { value: 'IN_PROGRESS', label: 'In Progress' },
                            { value: 'COMPLETED', label: 'Completed' },
                        ]}
                        error={validation.errors.status && validation.touched.status ? validation.errors.status : undefined}
                        placeholder="Select status"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="priority">
                        Priority
                    </FormLabel>
                    <Select
                        value={validation.values.priority}
                        onChange={(value) => validation.setFieldValue('priority', value)}
                        data={[
                            { value: 'LOW', label: 'Low' },
                            { value: 'MEDIUM', label: 'Medium' },
                            { value: 'HIGH', label: 'High' },
                        ]}
                        error={validation.errors.priority && validation.touched.priority ? validation.errors.priority : undefined}
                        placeholder="Select priority"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="leads">
                        Leads
                    </FormLabel>
                    <MultiSelect
                        data={leadOptions}
                        value={validation.values.leads}
                        onChange={(value) => {
                            validation.setFieldValue('leads', value);
                        }}
                        onBlur={validation.handleBlur}
                        searchable
                        nothingFound="No leads found"
                        placeholder="Select leads"
                        error={validation.errors.leads && validation.touched.leads ? String(validation.errors.leads) : undefined}
                    />
                </FormGroup>
                <FormGroup>
                    <FormLabel required htmlFor="dueDate">
                        Due Date
                    </FormLabel>
                    <FormInput
                        min={new Date().toISOString().split('T')[0]}
                        type="date"
                        {...validation.getFieldProps('dueDate')}
                        placeholder="Enter due date (YYYY-MM-DD)"
                        invalid={validation.errors.dueDate && validation.touched.dueDate ? true : false}
                        error={validation.errors.dueDate && validation.touched.dueDate ? validation.errors.dueDate : undefined}
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="description">
                        Description
                    </FormLabel>
                    <FormTextArea
                        className="border-black/20 min-h-[100px]"
                        {...validation.getFieldProps('description')}
                        placeholder="Enter task description"
                        invalid={validation.errors.description && validation.touched.description ? true : false}
                        error={validation.errors.description && validation.touched.description ? validation.errors.description : undefined}
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

export default TasksForm;
