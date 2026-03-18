import { FC } from 'react';

interface IconMobileProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconMobile: FC<IconMobileProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M7.20001 2.60244H4.80001M10.8 3.50244V9.50244C10.8 11.9024 10.2 12.5024 7.80001 12.5024H4.20001C1.80001 12.5024 1.20001 11.9024 1.20001 9.50244V3.50244C1.20001 1.10244 1.80001 0.502441 4.20001 0.502441H7.80001C10.2 0.502441 10.8 1.10244 10.8 3.50244ZM6.93001 9.83244C6.93001 10.3461 6.51364 10.7624 6.00001 10.7624C5.48639 10.7624 5.07001 10.3461 5.07001 9.83244C5.07001 9.31882 5.48639 8.90244 6.00001 8.90244C6.51364 8.90244 6.93001 9.31882 6.93001 9.83244Z"
                        stroke="currentColor"
                        strokeWidth="0.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M7.20001 2.60244H4.80001M10.8 3.50244V9.50244C10.8 11.9024 10.2 12.5024 7.80001 12.5024H4.20001C1.80001 12.5024 1.20001 11.9024 1.20001 9.50244V3.50244C1.20001 1.10244 1.80001 0.502441 4.20001 0.502441H7.80001C10.2 0.502441 10.8 1.10244 10.8 3.50244ZM6.93001 9.83244C6.93001 10.3461 6.51364 10.7624 6.00001 10.7624C5.48639 10.7624 5.07001 10.3461 5.07001 9.83244C5.07001 9.31882 5.48639 8.90244 6.00001 8.90244C6.51364 8.90244 6.93001 9.31882 6.93001 9.83244Z"
                        fill="currentColor"
                        opacity={duotone ? '0.5' : '1'}
                    />
                </svg>
            )}
        </>
    );
};

export default IconMobile;
