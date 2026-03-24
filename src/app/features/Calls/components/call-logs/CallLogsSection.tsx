import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { IconHistory, IconFilter, IconTrash } from '@tabler/icons-react';
import { CallLogItem } from './CallLogItem';
import type { CallLog } from '../../types';
import { clearCallLogs, setFilter } from '../../../../slices/callLogsSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface CallLogsSectionProps {
    callLogs: CallLog[];
    onCallBack: (phone: string, contactName: string) => void;
}

const CallLogsSection = React.memo(({ callLogs, onCallBack }: CallLogsSectionProps) => {
    const dispatch = useDispatch();
    const { filter } = useSelector((state: IRootState) => state.callLogs);

    const filteredLogs = React.useMemo(() => {
        if (filter === 'all') return callLogs;
        return callLogs.filter((log) => log.type === filter);
    }, [callLogs, filter]);

    const getFilterCount = React.useCallback(
        (type: 'all' | 'missed' | 'outgoing' | 'incoming') => {
            if (type === 'all') return callLogs.length;
            return callLogs.filter((log) => log.type === type).length;
        },
        [callLogs]
    );

    return (
        <motion.div className="flex flex-grow flex-col overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Recent activity:</span>
                </div>
                {/* <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-1 h-auto">
                        <IconFilter size={16} />
                    </Button>
                    {callLogs.length > 0 && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 p-1 h-auto" onClick={() => setShowClearDialog(true)}>
                            <IconTrash size={16} />
                        </Button>
                    )}
                </div> */}
            </div>

            {/* Filter Tabs */}
            {/* <div className=" flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'missed', label: 'Missed' },
                    { key: 'outgoing', label: 'Outgoing' },
                    { key: 'incoming', label: 'Incoming' },
                ].map((tab) => (
                    <motion.button
                        key={tab.key}
                        onClick={() => dispatch(setFilter(tab.key as any))}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {tab.label} ({getFilterCount(tab.key as any)})
                    </motion.button>
                ))}
            </div> */}

            {/* Call Logs List */}
            <PerfectScrollbar className=" flex-grow overflow-y-auto">
                <motion.div layout>
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((callLog, index: number) => (
                            <motion.div key={callLog.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                                <CallLogItem callLog={callLog} onCallBack={onCallBack} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div className="text-center py-8 text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                            <IconHistory className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No {filter !== 'all' ? filter : ''} calls found</p>
                        </motion.div>
                    )}
                </motion.div>
            </PerfectScrollbar>
        </motion.div>
    );
});

CallLogsSection.displayName = 'CallLogsSection';

export { CallLogsSection };
