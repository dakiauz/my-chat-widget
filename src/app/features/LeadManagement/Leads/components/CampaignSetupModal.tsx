import { FC, useState, useEffect, useMemo } from 'react';
import { Box, Button, Group, Text, TextInput, NumberInput, Checkbox, Stack, Divider, Textarea, Loader, Card, Badge, ScrollArea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useStartCampaignMutation } from '../services/campaignApi';
import ModalWrapper from '@/app/shared/components/ui/modals/crud-modal/ModalWrapper';

interface ICampaignSetupModalProps {
    isOpen: boolean;
    close: () => void;
    leadListId: string;
    leads?: any[];
    isTargeted?: boolean;
}

const CampaignSetupModal: FC<ICampaignSetupModalProps> = ({ isOpen, close, leadListId, leads = [], isTargeted = false }) => {
    const listIdNum = leadListId && leadListId !== 'all' ? parseInt(leadListId) : 0;

    const [startCampaign, { isLoading: isStarting }] = useStartCampaignMutation();

    const form = useForm({
        initialValues: {
            name: '',
            description: '',
            batch_size: 100,
            interval_hours: 24,
            email_subject: '',
            email_body: '',
            sms_body: '',
            stop_on_reply: true,
        },
        validate: {
            name: (val) => (val?.trim().length > 0 ? null : 'Campaign name is required'),
            batch_size: (val) => (val >= 1 && val <= 100 ? null : 'Batch limit is strictly 100 maximum'),
            interval_hours: (val) => (val >= 1 ? null : 'Interval must be at least 1'),
        },
    });

    const leadsWithEmail = useMemo(() => leads.filter((l) => l.email && l.email !== 'n/a' && l.email.trim() !== ''), [leads]);
    const leadsWithPhone = useMemo(() => leads.filter((l) => l.phone && l.phone !== 'n/a' && l.phone.trim() !== ''), [leads]);

    const hasEmails = leadsWithEmail.length > 0;
    const hasPhones = leadsWithPhone.length > 0;

    const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'both' | null>(null);

    const [isCalculating, setIsCalculating] = useState(false);
    const [estimatedTime, setEstimatedTime] = useState<{ testing: string, prod: string, isError?: boolean, explanation?: string } | null>(null);

    const maxAvailableLeads = useMemo(() => {
        if (selectedChannel === 'email') return leadsWithEmail.length;
        if (selectedChannel === 'sms') return leadsWithPhone.length;
        if (selectedChannel === 'both') {
            return leads.filter(l => (l.email && l.email !== 'n/a' && l.email.trim() !== '') || (l.phone && l.phone !== 'n/a' && l.phone.trim() !== '')).length;
        }
        return leads.length;
    }, [selectedChannel, leadsWithEmail.length, leadsWithPhone.length, leads]);

    // Enforce max batch size when channel changes
    useEffect(() => {
        if (maxAvailableLeads > 0 && form.values.batch_size > maxAvailableLeads) {
            form.setFieldValue('batch_size', maxAvailableLeads);
        }
    }, [maxAvailableLeads, form.values.batch_size]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset();
            setSelectedChannel(null);
        }
    }, [isOpen]);

    useEffect(() => {
        setIsCalculating(true);
        const timer = setTimeout(() => {
            if (!selectedChannel) {
                setEstimatedTime(null);
                setIsCalculating(false);
                return;
            }

            let numLeads = 0;
            if (selectedChannel === 'email') numLeads = leadsWithEmail.length;
            else if (selectedChannel === 'sms') numLeads = leadsWithPhone.length;
            else if (selectedChannel === 'both') {
                numLeads = leads.filter(l => (l.email && l.email !== 'n/a' && l.email.trim() !== '') || (l.phone && l.phone !== 'n/a' && l.phone.trim() !== '')).length;
            }

            if (numLeads === 0) {
                setEstimatedTime({
                    testing: 'N/A',
                    prod: 'N/A',
                    isError: true,
                    explanation: "There are no leads with valid contact information for this channel."
                });
                setIsCalculating(false);
                return;
            }

            const totalBatches = Math.ceil(numLeads / Math.max(1, form.values.batch_size));
            const totalUnits = totalBatches * form.values.interval_hours;

            if (totalUnits === 0) {
                setEstimatedTime({
                    testing: `Up to ${form.values.interval_hours} Minutes`,
                    prod: `Up to ${form.values.interval_hours} Hours`,
                    isError: false,
                    explanation: `Your batch size is maximum ${Math.min(form.values.batch_size, numLeads)} which will cover all ${numLeads} available leads. Messages will be smoothly processed across the first interval window. No additional batches are required.`
                });
                setIsCalculating(false);
                return;
            }

            let testingStr = `${totalUnits} Minutes`;
            if (totalUnits >= 60) {
                const h = Math.floor(totalUnits / 60);
                const m = totalUnits % 60;
                testingStr = m > 0 ? `${h} Hours, ${m} Minutes` : `${h} Hours`;
            }

            let prodStr = `${totalUnits} Hours`;
            if (totalUnits >= 24) {
                const d = Math.floor(totalUnits / 24);
                const h = totalUnits % 24;
                prodStr = h > 0 ? `${d} Days, ${h} Hours` : `${d} Days`;
            }

            setEstimatedTime({ testing: testingStr, prod: prodStr });
            setIsCalculating(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [form.values.batch_size, form.values.interval_hours, selectedChannel, leadsWithEmail.length, leadsWithPhone.length, leads]);

    const handleStart = async (values: typeof form.values) => {
        if (!listIdNum) return;

        try {
            const channels: string[] = [];
            if ((selectedChannel === 'email' || selectedChannel === 'both') && hasEmails) channels.push('email');
            if ((selectedChannel === 'sms' || selectedChannel === 'both') && hasPhones) channels.push('sms');

            if (channels.length === 0) {
                showNotification({ title: 'Error', message: 'Please select a valid channel to send message to.', color: 'red' });
                return;
            }

            if (channels.includes('email') && (!values.email_subject?.trim() || !values.email_body?.trim())) {
                showNotification({ title: 'Error', message: 'Please fill in email subject and body.', color: 'red' });
                return;
            }

            if (channels.includes('sms') && !values.sms_body?.trim()) {
                showNotification({ title: 'Error', message: 'Please fill in SMS body.', color: 'red' });
                return;
            }

            await startCampaign({
                lead_list_id: listIdNum,
                name: values.name,
                description: values.description,
                batch_size: values.batch_size,
                interval_hours: values.interval_hours,
                channels,
                email_subject: values.email_subject,
                email_body: values.email_body,
                sms_body: values.sms_body,
                stop_on_reply: values.stop_on_reply,
                ...(isTargeted && { lead_ids: leads.map(l => Number(l.id)) })
            }).unwrap();

            showNotification({ title: 'Success', message: 'Campaign started successfully', color: 'green' });
            close();
        } catch (error: any) {
            showNotification({ title: 'Error', message: error.data?.message || 'Failed to start campaign', color: 'red' });
        }
    };

    const body = (
        <form onSubmit={form.onSubmit(handleStart)}>
            <Stack>
                <TextInput
                    label="Campaign Name"
                    placeholder="e.g., February Leads Outreach"
                    {...form.getInputProps('name')}
                    required
                />
                <Textarea
                    label="Description (Optional)"
                    placeholder="Provide some details about this campaign..."
                    {...form.getInputProps('description')}
                    minRows={2}
                />

                <Group grow>
                    <NumberInput
                        label="Batch Size (Max 100)"
                        description={maxAvailableLeads > 0 ? `Max ${Math.min(100, maxAvailableLeads)} for selected channel` : 'Leads per batch (Max 100)'}
                        min={1}
                        max={Math.min(100, maxAvailableLeads || 100)}
                        {...form.getInputProps('batch_size')}
                    />
                    <NumberInput
                        label="Interval (Minutes/Hours)"
                        description="Time between batches"
                        min={1}
                        {...form.getInputProps('interval_hours')}
                    />
                </Group>

                <Card shadow="none" p="sm" radius="md" bg={estimatedTime?.isError ? 'red.0' : estimatedTime?.explanation ? 'blue.0' : 'gray.0'} withBorder>
                    {!selectedChannel ? (
                        <Text size="sm" color="dimmed">Please select an Email or SMS channel below to estimate completion time.</Text>
                    ) : isCalculating ? (
                        <Group spacing="sm">
                            <Loader size="xs" />
                            <Text size="sm" color="dimmed">Calculating estimated completion time...</Text>
                        </Group>
                    ) : estimatedTime ? (
                        <Box>
                            {estimatedTime.isError ? (
                                <Text size="sm" fw={500} color="red.7">⚠️ {estimatedTime.explanation}</Text>
                            ) : (
                                <>
                                    <Text size="sm" fw={600} mb={2}>⏳ Estimated Campaign Completion Time:</Text>
                                    <div className="flex flex-col gap-1 mt-1 pl-6">
                                        <Text size="sm"><b>Testing (Minutes):</b> {estimatedTime.testing}</Text>
                                        <Text size="sm"><b>Production (Hours):</b> {estimatedTime.prod}</Text>
                                    </div>
                                    {estimatedTime.explanation && (
                                        <Text size="sm" color="blue.7" mt="sm">💡 {estimatedTime.explanation}</Text>
                                    )}
                                </>
                            )}
                        </Box>
                    ) : null}
                </Card>

                <div className="flex flex-wrap items-center gap-4 mt-4 mb-2">
                    <Button
                        variant={form.values.stop_on_reply ? 'filled' : 'outline'}
                        color={form.values.stop_on_reply ? 'red' : 'gray'}
                        onClick={() => form.setFieldValue('stop_on_reply', !form.values.stop_on_reply)}
                        radius="xl"
                        size="sm"
                    >
                        Stop sending if Lead replies
                    </Button>
                </div>

                <Divider my="sm" />

                <Group spacing="md">
                    {hasEmails && (
                        <Button
                            variant={selectedChannel === 'email' ? 'filled' : 'outline'}
                            color="blue"
                            onClick={() => setSelectedChannel('email')}
                            sx={(theme) => ({
                                '&:hover': {
                                    backgroundColor: `${selectedChannel === 'email' ? theme.colors.blue[7] : theme.colors.blue[0]} !important`,
                                    color: `${selectedChannel === 'email' ? 'white' : theme.colors.blue[7]} !important`,
                                }
                            })}
                        >
                            Send Email
                        </Button>
                    )}
                    {hasPhones && (
                        <Button
                            variant={selectedChannel === 'sms' ? 'filled' : 'outline'}
                            color="teal"
                            onClick={() => setSelectedChannel('sms')}
                            sx={(theme) => ({
                                '&:hover': {
                                    backgroundColor: `${selectedChannel === 'sms' ? theme.colors.teal[7] : theme.colors.teal[0]} !important`,
                                    color: `${selectedChannel === 'sms' ? 'white' : theme.colors.teal[7]} !important`,
                                }
                            })}
                        >
                            Send SMS
                        </Button>
                    )}
                    {hasEmails && hasPhones && (
                        <Button
                            variant={selectedChannel === 'both' ? 'filled' : 'outline'}
                            color="purple"
                            onClick={() => setSelectedChannel('both')}
                            sx={(theme) => ({
                                '&:hover': {
                                    backgroundColor: `${selectedChannel === 'both' ? theme.colors.violet[7] : theme.colors.violet[0]} !important`,
                                    color: `${selectedChannel === 'both' ? 'white' : theme.colors.violet[7]} !important`,
                                }
                            })}
                        >
                            Send Both
                        </Button>
                    )}
                </Group>

                {selectedChannel && (
                    <Box mt="md">
                        {(selectedChannel === 'email' || selectedChannel === 'both') && hasEmails && (
                            <Box mb="md">
                                <Text size="xs" fw={500} color="dimmed" mb={4}>
                                    Email Recipients
                                </Text>
                                <ScrollArea h={leadsWithEmail.length > 3 ? 80 : 'auto'} type="auto" offsetScrollbars>
                                    <div className="flex flex-wrap gap-1">
                                        {leadsWithEmail.map((l) => (
                                            <Badge key={`email-${l.id}`} variant="outline" color="blue" size="sm">
                                                {l.email}
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </Box>
                        )}

                        {(selectedChannel === 'sms' || selectedChannel === 'both') && hasPhones && (
                            <Box mb="md">
                                <Text size="xs" fw={500} color="dimmed" mb={4}>
                                    SMS Recipients
                                </Text>
                                <ScrollArea h={leadsWithPhone.length > 3 ? 80 : 'auto'} type="auto" offsetScrollbars>
                                    <div className="flex flex-wrap gap-1">
                                        {leadsWithPhone.map((l) => (
                                            <Badge key={`phone-${l.id}`} variant="outline" color="teal" size="sm">
                                                {l.phone}
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </Box>
                        )}
                    </Box>
                )}

                {(selectedChannel === 'email' || selectedChannel === 'both') && hasEmails && (
                    <Box mt="md">
                        <Text fw={600} size="sm" mb="xs">Email Configuration</Text>
                        <TextInput
                            label="Subject line"
                            placeholder="Checking in"
                            mb="sm"
                            {...form.getInputProps('email_subject')}
                        />
                        <Textarea
                            label="Email Body"
                            placeholder="Hi there! Just wanted to..."
                            minRows={4}
                            {...form.getInputProps('email_body')}
                        />
                    </Box>
                )}

                {(selectedChannel === 'sms' || selectedChannel === 'both') && hasPhones && (
                    <Box mt="md">
                        <Text fw={600} size="sm" mb="xs">SMS Configuration</Text>
                        <Textarea
                            label="SMS Body"
                            placeholder="Hey! Are you still interested?"
                            minRows={3}
                            {...form.getInputProps('sms_body')}
                        />
                    </Box>
                )}

                <Button
                    type="submit"
                    color="green"
                    mt="xl"
                    fullWidth
                    size="md"
                    loading={isStarting}
                    sx={(theme) => ({
                        '&:hover': {
                            backgroundColor: `${theme.colors.green[7]} !important`,
                            color: 'white !important',
                        }
                    })}
                >
                    Start Campaign
                </Button>
            </Stack>
        </form>
    );

    return (
        <ModalWrapper
            headerTitle="Setup Automated Campaign"
            isOpen={isOpen}
            close={close}
            body={body}
        />
    );
};

export default CampaignSetupModal;
