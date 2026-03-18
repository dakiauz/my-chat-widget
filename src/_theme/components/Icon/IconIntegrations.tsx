import { FC } from 'react';

interface IconIntegrationsProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconIntegrations: FC<IconIntegrationsProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M12 2V6M12 18V22M4 12H8M16 12H20M6.34 6.34L9.17 9.17M14.83 14.83L17.66 17.66M14.83 9.17L17.66 6.34M6.34 17.66L9.17 14.83"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                    <path
                        d="M12 2V6M12 18V22M4 12H8M16 12H20M6.34 6.34L9.17 9.17M14.83 14.83L17.66 17.66M14.83 9.17L17.66 6.34M6.34 17.66L9.17 14.83"
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

export default IconIntegrations;
