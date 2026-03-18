import { FC } from 'react';

interface IconAccountsProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconAccounts: FC<IconAccountsProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        fill="currentColor"
                    />
                    <path
                        d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20"
                        fill="currentColor"
                        stroke={!duotone ? 'white' : 'currentColor'}
                    />
                </svg>
            )}
        </>
    );
};

export default IconAccounts;