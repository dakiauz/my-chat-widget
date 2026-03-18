import { FC } from 'react';

interface IconAISDRProps {
  className?: string;
  fill?: boolean;
  duotone?: boolean;
}

const IconAISDR: FC<IconAISDRProps> = ({ className, fill = false, duotone = true }) => {
  return (
    <>
      {!fill ? (
        // Outline version
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* AI/SDR Head (user profile) */}
          <circle
            cx="12"
            cy="8"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Body */}
          <path
            d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* AI Connection lines */}
          <path
            d="M3 6L6 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M21 6L18 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Filled version
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
          <path
            d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
          <path
            d="M3 6L6 9"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
          <path
            d="M21 6L18 9"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
        </svg>
      )}
    </>
  );
};

export default IconAISDR;
