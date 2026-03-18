import React, { useState } from 'react';

interface IconEyeProps {
    className?: string;
    hoverFill?: string; // Hover color
    fill?: string; // Base color
    hover?: boolean;
    duotone?: boolean; // Flag for duotone effect
}

const IconEye: React.FC<IconEyeProps> = ({ className = '', fill = '#3D4350', hoverFill = '#9E77ED', hover = false, duotone = false }) => {
    const secondaryColor = '#A0A0A0'; // Adjust this secondary color for duotone
    const [isHovered, setIsHovered] = useState(false);

    const primaryColor = isHovered && hover ? hoverFill : fill;
    const secondColor = duotone ? (isHovered && hover ? hoverFill : secondaryColor) : primaryColor;

    return (
        <svg
            className={className}
            width="23"
            height="16"
            viewBox="0 0 23 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.5 8C7.5 10.206 9.294 12 11.5 12C13.706 12 15.5 10.206 15.5 8C15.5 5.794 13.706 4 11.5 4C9.294 4 7.5 5.794 7.5 8ZM9.5 8C9.5 6.897 10.397 6 11.5 6C12.603 6 13.5 6.897 13.5 8C13.5 9.103 12.603 10 11.5 10C10.397 10 9.5 9.103 9.5 8Z"
                fill={'currentColor'}
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.581 8.394C0.714 8.705 3.928 16 11.5 16C19.072 16 22.286 8.705 22.419 8.394C22.527 8.143 22.527 7.857 22.419 7.606C22.286 7.295 19.072 0 11.5 0C3.928 0 0.714 7.295 0.581 7.606C0.473 7.857 0.473 8.143 0.581 8.394ZM11.5 14C6.102 14 3.331 9.406 2.609 8C3.331 6.594 6.102 2 11.5 2C16.899 2 19.671 6.596 20.392 8C19.67 9.406 16.898 14 11.5 14Z"
                fill={duotone ? secondColor : 'currentColor'}
                opacity={'0.9'}
            />
        </svg>
    );
};

export default IconEye;
