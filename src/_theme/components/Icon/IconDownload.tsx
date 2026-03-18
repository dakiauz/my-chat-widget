import React, { useState } from 'react';

interface IconDownloadProps {
    className?: string;
    fill?: string;
    hoverFill?: string; // Hover color
    hover?: boolean;
    duotone?: boolean;
}

const IconDownload: React.FC<IconDownloadProps> = ({ className = '', fill = '#3D4350', hoverFill = '#9E77ED', hover = false, duotone = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    const primaryColor = isHovered && hover ? hoverFill : fill;
    const secondaryColor = duotone ? (isHovered && hover ? hoverFill : '#A0A0A0') : primaryColor;

    return (
        <svg
            className={className}
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <path
                d="M10.4744 13.9997C10.4829 13.9999 10.4914 14 10.5 14C10.5093 14 10.5186 13.9999 10.5279 13.9996C10.8011 13.9921 11.047 13.8752 11.2231 13.6909L16.207 8.70701C16.598 8.31601 16.598 7.68401 16.207 7.29301C15.816 6.90201 15.184 6.90201 14.793 7.29301L11.5 10.586V1C11.5 0.448 11.052 0 10.5 0C9.948 0 9.5 0.448 9.5 1V10.586L6.20701 7.29301C5.81601 6.90201 5.18401 6.90201 4.79301 7.29301C4.40201 7.68401 4.40201 8.31601 4.79301 8.70701L9.77661 13.6906C9.95327 13.8756 10.2002 13.9928 10.4744 13.9997Z"
                fill={secondaryColor}
            />
            <path
                d="M20.5 17C20.5 18.654 19.154 20 17.5 20H3.5C1.846 20 0.5 18.654 0.5 17V13C0.5 12.447 0.948 12 1.5 12C2.052 12 2.5 12.447 2.5 13V17C2.5 17.552 2.949 18 3.5 18H17.5C18.052 18 18.5 17.552 18.5 17V13C18.5 12.447 18.947 12 19.5 12C20.053 12 20.5 12.447 20.5 13V17Z"
                fill={secondaryColor}
            />
        </svg>
    );
};

export default IconDownload;
