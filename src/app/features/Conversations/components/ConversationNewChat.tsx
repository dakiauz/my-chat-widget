import { Modal, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FC, useEffect } from 'react';
import IconUser from '../../../../_theme/components/Icon/IconUser';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import FormInput from '../../../shared/components/forms/FormInput';
import FormFeedback from '../../../shared/components/forms/FormFeedback';
import FormTextArea from '../../../shared/components/forms/FormTextArea';
import { useLocation } from 'react-router-dom';

interface ConversationNewChatProps {
    opened: boolean;
    onClose: () => void;
    onStartChat: (data: { phoneNumber: string; email: string; message: string; channel: 'SMS' | 'EMAIL' }) => void;
    loading?: boolean;
    open: () => void;
}

interface NewChatFormData {
    phoneNumber: string;
    message: string;
}

const ConversationNewChat: FC<ConversationNewChatProps> = ({ opened, onClose, onStartChat, loading = false, open }) => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.phone) {
            form.setFieldValue('phoneNumber', location.state.phone);
            open();
        }
    }, [location.state?.phone]);

    const form = useForm<NewChatFormData>({
        initialValues: {
            phoneNumber: '',
            message: '',
        },
        validate: {
            phoneNumber: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Phone number is required';
                }
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                const cleanedPhone = value.replace(/[\s\-\(\)]/g, '');
                if (!phoneRegex.test(cleanedPhone)) {
                    return 'Please enter a valid phone number';
                }
                if (cleanedPhone.length < 10) {
                    return 'Phone number must be at least 10 digits';
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

    const handleSubmit = (values: NewChatFormData) => {
        const cleanedPhoneNumber = values.phoneNumber.replace(/[\s\-\(\)]/g, '');

        onStartChat({
            phoneNumber: cleanedPhoneNumber,
            email: '',
            message: values.message.trim(),
            channel: 'SMS',
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
                        New SMS Chat
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
                        Enter a phone number and message to start a new SMS conversation.
                    </Text>
                </div>

                <FormGroup>
                    <FormLabel required htmlFor="phoneNumber">
                        Phone Number
                    </FormLabel>
                    <FormInput id="phoneNumber" placeholder="Enter phone number (e.g., +1234567890)" {...form.getInputProps('phoneNumber')} disabled={loading} />
                    <FormFeedback error={form.errors.phoneNumber as string} />
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
                            {loading ? 'Sending...' : 'Send SMS'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ConversationNewChat;
