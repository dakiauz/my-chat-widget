import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

// Device Status Component
const DeviceStatus = ({ connectionStatus, isRefreshingToken }: { connectionStatus: string; isRefreshingToken: boolean }) => {
    // Define status configurations
    const statusConfig = {
        connected: {
            bg: 'bg-green-100',
            text: 'text-green-700',
            label: 'Connected',
            icon: <div className="w-2 h-2 rounded-full bg-green-500" />,
        },
        connecting: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            label: isRefreshingToken ? 'Refreshing...' : 'Connecting...',
            icon: isRefreshingToken ? <IconRefresh size={12} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-yellow-500" />,
        },
        disconnected: {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            label: 'Disconnected',
            icon: <div className="w-2 h-2 rounded-full bg-gray-500" />,
        },
        error: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            label: 'Connection Error',
            icon: <IconAlertCircle size={12} />,
        },
    };

    const status = statusConfig[connectionStatus as keyof typeof statusConfig] || statusConfig.disconnected;

    return (
        <div className="px-4 py-2 text-center">
            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${status.bg} ${status.text}`}>
                {status.icon}
                {status.label}
            </div>
        </div>
    );
};

DeviceStatus.displayName = 'DeviceStatus';

export default DeviceStatus;
