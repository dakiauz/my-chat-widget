import { FC } from 'react';

interface IconAnalyticsProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconAnalytics: FC<IconAnalyticsProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M3 21V3M8 17V13M12 21V9M16 17V3M21 21V3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M3 21V3M8 17V13M12 21V9M16 17V3M21 21V3"
                        fill="currentColor"
                        stroke={!duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </>
    );
};

export default IconAnalytics;
