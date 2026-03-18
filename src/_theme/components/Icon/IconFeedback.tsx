import { FC } from 'react';

interface IconFeedbackProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconFeedback: FC<IconFeedbackProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M0.679688 19.2379V2.57088C0.679688 2.06161 0.861172 1.6258 1.22414 1.26345C1.58711 0.901096 2.02292 0.719611 2.53157 0.718994H17.3467C17.8559 0.718994 18.2921 0.900479 18.655 1.26345C19.018 1.62642 19.1992 2.06223 19.1986 2.57088V13.6822C19.1986 14.1915 19.0174 14.6276 18.655 14.9906C18.2927 15.3535 17.8566 15.5347 17.3467 15.5341H4.38346L0.679688 19.2379ZM4.38346 11.8303H11.791V9.97843H4.38346V11.8303ZM4.38346 9.05249H15.4948V7.2006H4.38346V9.05249ZM4.38346 6.27466H15.4948V4.42277H4.38346V6.27466Z"
                fill={fill ? 'currentColor' : 'white'}
                opacity={duotone ? '1' : '1'}
            />
        </svg>
    );
};

export default IconFeedback;
