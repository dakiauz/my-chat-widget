'use client';

import { InboxType } from './ConversationsList';

interface InboxDropdownProps {
    selectedInbox: string;
    onSelect: (inbox: InboxType) => void;
    onClose: () => void;
}

export default function InboxDropdown({ selectedInbox, onSelect, onClose }: InboxDropdownProps) {
    const inboxes = ['All Inboxes', 'Email', 'Sms'] as const;

    return (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-gray-200 bg-white shadow-lg z-10">
            <div className="py-1">
                {inboxes.map((inbox) => (
                    <button key={inbox} className="flex w-full items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50" onClick={() => onSelect(inbox)}>
                        <div className="flex items-center gap-2">
                            {/* {inbox === 'WhatsApp' && <span className="h-2 w-2 rounded-full bg-green-500"></span>} */}
                            {inbox === 'Email' && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                            {inbox === 'Sms' && <span className="h-2 w-2 rounded-full bg-gray-500"></span>}
                            {inbox}
                        </div>
                        {selectedInbox === inbox && (
                            <svg className="h-4 w-4 text-purple-600" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
