import React, { useState } from 'react';

interface IconPrintProps {
    className?: string;
    fill?: string; // Base color
    hoverFill?: string; // Hover color
    hover?: boolean; // Flag to enable hover effect
    duotone?: boolean; // Flag for duotone effect
}

const IconPrint: React.FC<IconPrintProps> = ({ className = '', fill = '#3D4350', hoverFill = '#9E77ED', hover = false, duotone = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    const primaryColor = isHovered && hover ? hoverFill : fill;
    const secondaryColor = duotone ? (isHovered && hover ? hoverFill : '#A0A0A0') : primaryColor;

    return (
        <svg
            className={className}
            width="23"
            height="22"
            viewBox="0 0 23 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.5 18H3.5C1.846 18 0.5 16.654 0.5 15V10C0.5 8.346 1.846 7 3.5 7H4.5V1C4.5 0.448 4.948 0 5.5 0H17.5C18.053 0 18.5 0.448 18.5 1V7H19.5C21.154 7 22.5 8.346 22.5 10V15C22.5 16.654 21.154 18 19.5 18H18.5V21C18.5 21.553 18.053 22 17.5 22H5.5C4.948 22 4.5 21.553 4.5 21V18ZM19.5 9C20.052 9 20.5 9.449 20.5 10V15C20.5 15.552 20.052 16 19.5 16H18.5V13C18.5 12.447 18.053 12 17.5 12H5.5C4.948 12 4.5 12.447 4.5 13V16H3.5C2.949 16 2.5 15.552 2.5 15V10C2.5 9.449 2.949 9 3.5 9H19.5ZM16.5 14H6.5V20H16.5V14ZM16.5 2V7H6.5V2H16.5Z"
                fill={secondaryColor}
            />
        </svg>
    );
};

export default IconPrint;
