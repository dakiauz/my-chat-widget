import { motion } from 'framer-motion';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
// Error Display Component
const ErrorDisplay = ({ error, isRefreshingToken }: { error: string; isRefreshingToken: boolean }) => (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 border rounded-lg mx-4 mb-4 bg-red-50 border-red-200">
        <div className="flex items-center gap-2 text-red-700">
            {isRefreshingToken ? <IconRefresh size={16} className="animate-spin" /> : <IconAlertCircle size={16} />}
            <span className="text-[10px]">{isRefreshingToken ? 'Refreshing connection...' : error}</span>
        </div>
    </motion.div>
);

export default ErrorDisplay;
