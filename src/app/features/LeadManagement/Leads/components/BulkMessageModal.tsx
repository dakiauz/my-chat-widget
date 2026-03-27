import { FC, useState, useEffect } from 'react';
import { Modal, TextInput, Textarea, Badge, Text, ScrollArea, Divider, Group, Stack, ActionIcon, Alert } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import { ILead } from '../models/lead';
import { useBulkMessageMutation } from '../services/leadsApi';
import { useSelector } from 'react-redux';
import { IRootState } from '@/app/store';
import Tooltip from '@/app/shared/components/ui/Tooltip';

interface BulkMessageModalProps {
    isOpen: boolean;
    close: () => void;
    selectedLeads: ILead[];
    onSuccess?: () => void;
}

const BulkMessageModal: FC<BulkMessageModalProps> = ({ isOpen, close, selectedLeads, onSuccess }) => {
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [smsBody, setSmsBody] = useState('');

    const [bulkMessage, { isLoading }] = useBulkMessageMutation();
    const auth = useSelector((state: IRootState) => state.auth);
    const canSendSMS = !!auth?.user?.can_send_sms;
    const canSendEmail = !!auth?.user?.can_send_email;

    const [activeEmails, setActiveEmails] = useState<ILead[]>([]);
    const [activePhones, setActivePhones] = useState<ILead[]>([]);

    const [wasTruncated, setWasTruncated] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const validEmails = selectedLeads.filter((l) => l.email && l.email !== 'n/a' && l.email.trim() !== '');
            const validPhones = selectedLeads.filter((l) => l.phone && l.phone !== 'n/a' && l.phone.trim() !== '');

            setWasTruncated(validEmails.length > 10 || validPhones.length > 10);

            setActiveEmails(validEmails.slice(0, 10));
            setActivePhones(validPhones.slice(0, 10));
        }
    }, [isOpen, selectedLeads]);

    const hasEmails = activeEmails.length > 0;
    const hasPhones = activePhones.length > 0;
    const hasAnyRecipient = hasEmails || hasPhones;

    const uniqueSelectedCount = new Set([...activeEmails.map(l => l.id), ...activePhones.map(l => l.id)]).size;

    const handleSubmit = async () => {
        if (!hasAnyRecipient) {
            showNotification({ title: 'Error', message: 'No Phone number or Email to send message to.', color: 'red' });
            return;
        }

        if (activeEmails.length > 10 || activePhones.length > 10) {
            showNotification({ title: 'Error', message: 'You cannot send to more than 10 recipients per channel.', color: 'red' });
            return;
        }

        if (hasEmails && (!emailSubject.trim() || !emailBody.trim())) {
            showNotification({ title: 'Error', message: 'Please fill in email subject and body.', color: 'red' });
            return;
        }

        if (hasPhones && !smsBody.trim()) {
            showNotification({ title: 'Error', message: 'Please fill in SMS body.', color: 'red' });
            return;
        }

        try {
            const result = await bulkMessage({
                leadIds: Array.from(new Set([...activeEmails.map(l => l.id), ...activePhones.map(l => l.id)])),
                sendEmail: hasEmails,
                sendSms: hasPhones,
                emailSubject: hasEmails ? emailSubject : null,
                emailBody: hasEmails ? emailBody : null,
                smsBody: hasPhones ? smsBody : null,
            }).unwrap();

            const summary = result?.summary;
            let message = 'Bulk message processed.';
            if (summary) {
                const parts = [];
                if (summary.emails_sent > 0) parts.push(`${summary.emails_sent} email(s) sent`);
                if (summary.sms_sent > 0) parts.push(`${summary.sms_sent} SMS sent`);
                if (summary.emails_failed > 0) parts.push(`${summary.emails_failed} email(s) failed`);
                if (summary.sms_failed > 0) parts.push(`${summary.sms_failed} SMS failed`);
                if (parts.length > 0) message = parts.join(', ');
            }

            showNotification({ title: 'Success', message, color: 'green' });
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error?.data?.message || error?.message || 'Failed to send bulk message.',
                color: 'red',
            });
        }
    };

    const handleClose = () => {
        setEmailSubject('');
        setEmailBody('');
        setSmsBody('');
        close();
    };

    return (
        <Modal opened={isOpen} onClose={handleClose} title="Send Bulk Message" size="lg" centered>
            <Stack spacing="md">
                {wasTruncated && (
                    <Alert color="yellow" title="Anti-Spam Limit Applied">
                        To ensure high deliverability, manual bulk messages are strictly limited to 10 recipients per channel. The list below has been automatically truncated to your first 10 selections.
                    </Alert>
                )}

                {(!canSendEmail || !canSendSMS) && (
                    <Alert color="blue" title="Integrations Required">
                        <Stack spacing="xs">
                            {!canSendEmail && <Text size="sm">📧 Email is not connected. Please go to the <b>Integrations</b> tab to set up your email.</Text>}
                            {!canSendSMS && <Text size="sm">💬 Twilio is not connected. Please go to the <b>Integrations</b> tab to set up SMS.</Text>}
                        </Stack>
                    </Alert>
                )}

                {/* Selected Leads Summary */}
                <div>
                    <Text size="sm" fw={600} mb={4}>
                        Selected Leads: {uniqueSelectedCount}
                    </Text>
                    <Group spacing="xs">
                        <Badge color="blue" variant="light" size="sm">
                            {activeEmails.length} with email
                        </Badge>
                        <Badge color="teal" variant="light" size="sm">
                            {activePhones.length} with phone
                        </Badge>
                    </Group>
                </div>

                {/* No recipients warning */}
                {!hasAnyRecipient && (
                    <Text size="sm" color="red" fw={500}>
                        No Phone number or Email to send message to.
                    </Text>
                )}

                {/* Email Addresses */}
                {hasEmails && (
                    <div style={{ opacity: canSendEmail ? 1 : 0.5 }}>
                        <Group spacing={8} mb={4}>
                            <Text size="xs" fw={500} color="dimmed">
                                Email Recipients
                            </Text>
                            {!canSendEmail && (
                                <Badge color="red" size="xs" variant="filled">Email Connection Required</Badge>
                            )}
                        </Group>
                        <ScrollArea h={activeEmails.length > 3 ? 80 : 'auto'} type="auto" offsetScrollbars>
                            <div className="flex flex-wrap gap-1">
                                {activeEmails.map((l) => (
                                    <Badge
                                        key={`email-${l.id}`}
                                        variant="outline"
                                        color="blue"
                                        size="sm"
                                        rightSection={
                                            <ActionIcon size="xs" color="blue" radius="xl" variant="transparent" onClick={() => setActiveEmails(prev => prev.filter(e => e.id !== l.id))}>
                                                <IconX size={10} />
                                            </ActionIcon>
                                        }
                                        sx={{ paddingRight: 3 }}
                                    >
                                        {l.email}
                                    </Badge>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Phone Numbers */}
                {hasPhones && (
                    <div style={{ opacity: canSendSMS ? 1 : 0.5 }}>
                        <Group spacing={8} mb={4}>
                            <Text size="xs" fw={500} color="dimmed">
                                SMS Recipients
                            </Text>
                            {!canSendSMS && (
                                <Badge color="red" size="xs" variant="filled">Twilio Connection Required</Badge>
                            )}
                        </Group>
                        <ScrollArea h={activePhones.length > 3 ? 80 : 'auto'} type="auto" offsetScrollbars>
                            <div className="flex flex-wrap gap-1">
                                {activePhones.map((l) => (
                                    <Badge
                                        key={`phone-${l.id}`}
                                        variant="outline"
                                        color="teal"
                                        size="sm"
                                        rightSection={
                                            <ActionIcon size="xs" color="teal" radius="xl" variant="transparent" onClick={() => setActivePhones(prev => prev.filter(e => e.id !== l.id))}>
                                                <IconX size={10} />
                                            </ActionIcon>
                                        }
                                        sx={{ paddingRight: 3 }}
                                    >
                                        {l.phone}
                                    </Badge>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {hasAnyRecipient && <Divider />}

                {/* Email Section */}
                {hasEmails && (
                    <div>
                        <Text size="sm" fw={600} mb="xs" color={canSendEmail ? 'dark' : 'dimmed'}>
                            📧 Email {!canSendEmail && '(Integration Required)'}
                        </Text>
                        <Stack spacing="xs" sx={{ pointerEvents: canSendEmail ? 'auto' : 'none', opacity: canSendEmail ? 1 : 0.6 }}>
                            <TextInput placeholder="Email Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.currentTarget.value)} size="sm" />
                            <Textarea
                                placeholder="Type your email message here..."
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.currentTarget.value)}
                                minRows={4}
                                maxRows={8}
                                autosize
                                size="sm"
                            />
                        </Stack>
                    </div>
                )}

                {hasEmails && hasPhones && <Divider />}

                {/* SMS Section */}
                {hasPhones && (
                    <div>
                        <Text size="sm" fw={600} mb="xs" color={canSendSMS ? 'dark' : 'dimmed'}>
                            💬 SMS {!canSendSMS && '(Integration Required)'}
                        </Text>
                        <Stack spacing="xs" sx={{ pointerEvents: canSendSMS ? 'auto' : 'none', opacity: canSendSMS ? 1 : 0.6 }}>
                            <Textarea
                                placeholder="Type your SMS message here..."
                                value={smsBody}
                                onChange={(e) => setSmsBody(e.currentTarget.value)}
                                minRows={3}
                                maxRows={5}
                                autosize
                                size="sm"
                            />
                            <Text size="xs" color="dimmed" align="right">
                                {smsBody.length}/1600 characters
                            </Text>
                        </Stack>
                    </div>
                )}

                {/* Actions */}
                <Group position="right" mt="md">
                    <button className="btn btn-outline-danger rounded-lg shadow-none" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        className="btn rounded-lg shadow-none text-white"
                        style={{ backgroundColor: '#7C3AED' }}
                        onClick={handleSubmit}
                        disabled={isLoading || !hasAnyRecipient || (hasEmails && !canSendEmail) || (hasPhones && !canSendSMS)}
                    >
                        {isLoading ? 'Sending...' : 'Send Message'}
                    </button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default BulkMessageModal;
