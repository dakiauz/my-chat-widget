import { useMemo } from 'react';
import { useGetConversationChannelsQuery } from '../services/conversationsApiSlice';

interface PlatformSelectorProps {
    onSelect: (platform: number) => void;
    selectedPlatform: number | undefined;
    onClose: () => void;
    selectedConversationId: number;
}

export default function PlatformSelector({ onSelect, selectedPlatform, onClose, selectedConversationId }: PlatformSelectorProps) {
    const { data: platformData, isLoading } = useGetConversationChannelsQuery(selectedConversationId);

    const platformOptions = useMemo(() => {
        if (!platformData) return [];

        return platformData.channels.map((channel) => ({
            id: channel.id,
            name: channel.name,
        }));
    }, [platformData]);

    return (
        <div className="absolute bottom-16 right-6 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32">
            <div className="py-1">
                {platformOptions.map((option) => (
                    <button
                        key={option.id}
                        className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${selectedPlatform === option.id ? 'bg-gray-100' : ''}`}
                        onClick={() => {
                            onSelect(option.id);
                            onClose();
                        }}
                    >
                        {option.name}
                        {selectedPlatform === option.id && (
                            <svg className="ml-auto h-4 w-4 text-purple-600" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
