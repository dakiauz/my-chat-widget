import { FC } from 'react';

interface IconConversationsProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconConversations: FC<IconConversationsProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M3 8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V12C21 14.7614 18.7614 17 16 17H10L5 21V17H3C2.44772 17 2 16.5523 2 16V8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M7 10H17M7 14H13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M3 8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V12C21 14.7614 18.7614 17 16 17H10L5 21V17H3C2.44772 17 2 16.5523 2 16V8Z"
                        fill="currentColor"
                        stroke={!duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M7 10H17M7 14H13"
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

export default IconConversations;
