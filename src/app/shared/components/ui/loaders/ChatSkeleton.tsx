import React, { useState, useEffect, useRef } from 'react';

const ChatSkeleton = () => {
    const [skeletonCount, setSkeletonCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const containerHeight = containerRef.current.offsetHeight;
            const skeletonHeight = 80; // Approximate height of one skeleton (adjust as needed)
            const count = Math.floor(containerHeight / skeletonHeight);
            setSkeletonCount(count);
        }
    }, []);

    return (
        <div ref={containerRef} role="status" className="flex-1 scroll-smooth overflow-y-auto p-4 space-y-4 md:p-6">
            {Array.from({ length: skeletonCount }).map((_, index) => (
                <React.Fragment key={index}>
                    {/* Sent Message Skeleton */}
                    <div className="flex justify-end">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 max-w-xs w-full animate-pulse">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>

                    {/* Received Message Skeleton */}
                    <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 max-w-xs w-full animate-pulse">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default ChatSkeleton;
