import { Modal, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FC } from 'react';
import IconUser from '../../../../_theme/components/Icon/IconUser';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import FormInput from '../../../shared/components/forms/FormInput';
import FormFeedback from '../../../shared/components/forms/FormFeedback';
import FormTextArea from '../../../shared/components/forms/FormTextArea';

interface ConversationNewEmailProps {
    opened: boolean;
    onClose: () => void;
    onStartEmail: (data: { phoneNumber: string; email: string; subject: string; message: string; channel: 'SMS' | 'EMAIL' }) => void;
    loading?: boolean;
}

interface NewEmailFormData {
    email: string;
    subject: string;
    message: string;
}

const ConversationNewEmail: FC<ConversationNewEmailProps> = ({ opened, onClose, onStartEmail, loading = false }) => {
    const form = useForm<NewEmailFormData>({
        initialValues: {
            email: '',
            subject: '',
            message: '',
        },
        validate: {
            email: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Email is required';
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return 'Please enter a valid email address';
                }
                return null;
            },
            subject: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Subject is required';
                }
                return null;
            },
            message: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Message is required';
                }
                return null;
            },
        },
    });

    const handleSubmit = (values: NewEmailFormData) => {
        onStartEmail({
            phoneNumber: '',
            email: values.email.trim(),
            subject: values.subject.trim(),
            message: values.message.trim(),
            channel: 'EMAIL',
        });

        form.reset();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <div className="flex items-center gap-2">
                    <IconUser className="text-primary" />
                    <Text size="lg" fw={600}>
                        New Email
                    </Text>
                </div>
            }
            size="md"
            centered
            closeOnClickOutside={!loading}
            closeOnEscape={!loading}
        >
            <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
                <div>
                    <Text size="sm" c="dimmed">
                        Enter an email address, subject, and message to send a new email.
                    </Text>
                </div>

                <FormGroup>
                    <FormLabel required htmlFor="email">
                        Email Address
                    </FormLabel>
                    <FormInput id="email" placeholder="Enter email address" {...form.getInputProps('email')} disabled={loading} />
                    <FormFeedback error={form.errors.email as string} />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="subject">
                        Subject
                    </FormLabel>
                    <FormInput id="subject" placeholder="Enter email subject" {...form.getInputProps('subject')} disabled={loading} />
                    <FormFeedback error={form.errors.subject as string} />
                </FormGroup>

                <FormGroup>
                    <FormLabel required htmlFor="message">
                        Message
                    </FormLabel>
                    <FormTextArea className="min-h-[100px] max-h-[200px]" id="message" placeholder="Enter your message" {...form.getInputProps('message')} disabled={loading} />
                    <FormFeedback error={form.errors.message as string} />
                </FormGroup>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="btn bg-BG border-BG  shadow-none  rounded-lg" onClick={() => handleClose()}>
                        Cancel
                    </button>
                    <div className="flex items-center gap-2">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Email'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ConversationNewEmail;
