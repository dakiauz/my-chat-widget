import { FC, useState, useEffect } from 'react';
import { Box, Button, Card, Flex, Group, Text, Badge, Progress, ActionIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconPlayerPause, IconPlayerStop, IconCircleCheck, IconX, IconPlayerPlay } from '@tabler/icons-react';
import { useGetCampaignForLeadListQuery, useUpdateCampaignStatusMutation } from '../services/campaignApi';

interface ICampaignBannerProps {
    leadListId: string;
}

const CampaignBanner: FC<ICampaignBannerProps> = ({ leadListId }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    // Convert to number, but if not selected or invalid, pass 0 (will skip)
    const listIdNum = leadListId && leadListId !== 'all' ? parseInt(leadListId) : 0;

    useEffect(() => {
        setIsDismissed(false);
    }, [listIdNum]);

    const { data, isLoading } = useGetCampaignForLeadListQuery(listIdNum, {
        skip: !listIdNum,
        pollingInterval: 3000, // Poll every 3 seconds to show live progress
    });

    const [updateStatus, { isLoading: isStatusUpdating }] = useUpdateCampaignStatusMutation();

    const campaign = data?.campaign;

    const handleStatusUpdate = async (status: 'active' | 'paused' | 'cancelled') => {
        if (!campaign) return;
        try {
            await updateStatus({ id: campaign.id, status }).unwrap();
            showNotification({ title: 'Status Updated', message: `Campaign is now ${status}`, color: 'blue' });
        } catch (error: any) {
            showNotification({ title: 'Error', message: error.data?.message || 'Failed to update status', color: 'red' });
        }
    };

    const handleDismiss = () => {
        if (campaign) {
            localStorage.setItem(`dismissed_campaign_${campaign.id}`, 'true');
        }
        setIsDismissed(true);
    };

    const renderActiveCampaign = () => {
        if (!campaign) return null;

        const total = campaign.total_leads || 0;
        const sent = campaign.sent_leads || 0;
        const failed = campaign.failed_leads || 0;

        const progress = total > 0 ? (sent / total) * 100 : 0;

        let statusColor = 'blue';
        if (campaign.status === 'paused') statusColor = 'yellow';
        if (campaign.status === 'completed') statusColor = 'green';
        if (campaign.status === 'cancelled') statusColor = 'red';

        if (campaign.status === 'completed' || campaign.status === 'cancelled') {
            const isCompleted = campaign.status === 'completed';
            const color = isCompleted ? 'teal' : 'red';
            const Icon = isCompleted ? IconCircleCheck : IconX;
            return (
                <Card shadow="sm" p="lg" radius="md" withBorder mb="lg" bg={`${color}.0`} sx={{ borderLeft: `6px solid var(--mantine-color-${color}-6)` }}>
                    <Flex justify="space-between" align="center">
                        <Flex gap="xl" align="center">
                            <Box c={`${color}.6`}>
                                <Icon size={64} stroke={1.5} />
                            </Box>

                            <Box>
                                <Group mb="xs">
                                    <Text fw={700} size="xl">{campaign.name || 'Automated Drip Campaign'}</Text>
                                    <Badge color={color} variant="filled" size="sm">{campaign.status.toUpperCase()}</Badge>
                                </Group>
                                {campaign.description && (
                                    <Text size="sm" color="dimmed" mb="xs">
                                        {campaign.description}
                                    </Text>
                                )}
                                <Text size="sm" c={`${color}.8`} mb="md" fw={500}>
                                    {isCompleted ? 'All leads in this list have been processed.' : 'This campaign was manually stopped.'}
                                </Text>

                                <Group spacing="lg">
                                    <Box>
                                        <Text size="xs" tt="uppercase" fw={600} c="dimmed">Total Processed</Text>
                                        <Text size="xl" fw={700} c="blue.7">{total}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" tt="uppercase" fw={600} c="dimmed">Successfully Sent</Text>
                                        <Text size="xl" fw={700} c="teal.7">{sent}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" tt="uppercase" fw={600} c="dimmed">Failed</Text>
                                        <Text size="xl" fw={700} c="red.7">{failed}</Text>
                                    </Box>
                                </Group>
                            </Box>
                        </Flex>

                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            onClick={handleDismiss}
                            sx={{ alignSelf: 'flex-start' }}
                            title="Dismiss"
                        >
                            <IconX size={20} />
                        </ActionIcon>
                    </Flex>
                </Card>
            );
        }

        return (
            <Card shadow="md" p="xl" radius="md" withBorder mb="lg" sx={{ borderColor: campaign.status === 'paused' ? 'var(--mantine-color-yellow-4)' : 'var(--mantine-color-blue-4)', borderTopWidth: 4 }}>
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap="lg">
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                        <Group mb="xs">
                            <Text fw={700} size="xl">{campaign.name || 'Automated Drip Campaign'}</Text>
                            <Badge color={statusColor} variant="filled" size="md">{campaign.status.toUpperCase()}</Badge>
                        </Group>
                        {campaign.description && (
                            <Text size="sm" color="dimmed" mb="sm">
                                {campaign.description}
                            </Text>
                        )}
                        <Text size="sm" c="dimmed" mb="lg">
                            Dispatching batches of <b>{campaign.batch_size} messages</b> every <b>{campaign.interval_hours} {campaign.interval_hours === 1 ? 'hour' : 'hours'}</b> automatically.
                        </Text>

                        <Box mb="sm">
                            <Group position="apart" mb={5}>
                                <Text size="sm" fw={600}>Sending Progress</Text>
                                <Text size="sm" fw={700}>{Math.round(progress)}%</Text>
                            </Group>
                            <Progress
                                value={progress}
                                size="xl"
                                radius="xl"
                                color={statusColor}
                                striped={campaign.status === 'active'}
                                animate={campaign.status === 'active'}
                            />
                        </Box>

                        <Group spacing="xl" mt="xl">
                            <Flex direction="column">
                                <Text size="xs" tt="uppercase" fw={600} c="dimmed">Total Leads</Text>
                                <Text size="lg" fw={700}>{total}</Text>
                            </Flex>
                            <Flex direction="column">
                                <Text size="xs" tt="uppercase" fw={600} c="dimmed">Delivered</Text>
                                <Text size="lg" fw={700} c="green.7">{sent}</Text>
                            </Flex>
                            <Flex direction="column">
                                <Text size="xs" tt="uppercase" fw={600} c="dimmed">Failed / Errors</Text>
                                <Text size="lg" fw={700} c="red.7">{failed}</Text>
                            </Flex>
                        </Group>
                    </Box>

                    <Flex direction="column" gap="sm" sx={{ minWidth: '150px' }}>
                        {campaign.status === 'active' && (
                            <Button
                                leftIcon={<IconPlayerPause size={16} />}
                                color="yellow"
                                variant="light"
                                size="md"
                                loading={isStatusUpdating}
                                onClick={() => handleStatusUpdate('paused')}
                            >
                                Pause Sending
                            </Button>
                        )}
                        {campaign.status === 'paused' && (
                            <Button
                                leftIcon={<IconPlayerPlay size={16} />}
                                color="blue"
                                variant="light"
                                size="md"
                                loading={isStatusUpdating}
                                onClick={() => handleStatusUpdate('active')}
                            >
                                Resume Sending
                            </Button>
                        )}
                        {(campaign.status === 'active' || campaign.status === 'paused') && (
                            <Button
                                leftIcon={<IconPlayerStop size={16} />}
                                color="red"
                                variant="subtle"
                                size="sm"
                                loading={isStatusUpdating}
                                onClick={() => handleStatusUpdate('cancelled')}
                            >
                                Stop Campaign
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>
        );
    };

    if (campaign && !isDismissed && localStorage.getItem(`dismissed_campaign_${campaign.id}`) !== 'true') {
        return renderActiveCampaign();
    }

    return null;
};

export default CampaignBanner;
