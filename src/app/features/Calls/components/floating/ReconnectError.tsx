import { Button } from '../../components/ui/button';
import { IconAlertCircle } from '@tabler/icons-react';

const ReconnectError = ({ onReconnect }: { onReconnect: () => void }) => (
    <div className="p-3 border rounded-lg mx-4 mb-4 bg-yellow-50 border-yellow-300 flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-800">
            <IconAlertCircle size={16} />
            <span className="text-xs font-medium">Device connection lost. Please reconnect to continue making/receiving calls.</span>
        </div>
        <Button size="sm" className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={onReconnect}>
            Reconnect
        </Button>
    </div>
);

export default ReconnectError;
