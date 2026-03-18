import { FC } from 'react';

interface IconTasksProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconTasks: FC<IconTasksProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path opacity={duotone ? '0.5' : '1'} d="M7 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity={duotone ? '0.5' : '1'} d="M7 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity={duotone ? '0.5' : '1'} d="M7 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default IconTasks;
