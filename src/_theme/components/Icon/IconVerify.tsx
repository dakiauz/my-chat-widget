import { FC } from 'react';

interface IconVerifyProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconVerify: FC<IconVerifyProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M12 2L15 5H18C19.6569 5 21 6.34315 21 8V16C21 17.6569 19.6569 19 18 19H15L12 22L9 19H6C4.34315 19 3 17.6569 3 16V8C3 6.34315 4.34315 5 6 5H9L12 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M12 2L15 5H18C19.6569 5 21 6.34315 21 8V16C21 17.6569 19.6569 19 18 19H15L12 22L9 19H6C4.34315 19 3 17.6569 3 16V8C3 6.34315 4.34315 5 6 5H9L12 2Z"
                        fill="currentColor"
                        stroke={!duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path d="M9 12L11 14L15 10" fill="currentColor" stroke={!duotone ? 'white' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </>
    );
};

export default IconVerify;
