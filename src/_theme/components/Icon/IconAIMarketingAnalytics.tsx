import { FC } from 'react';

interface IconAIMarketingAnalyticsProps {
  className?: string;
  fill?: boolean;
  duotone?: boolean;
}

const IconAIMarketingAnalytics: FC<IconAIMarketingAnalyticsProps> = ({
  className,
  fill = false,
  duotone = true,
}) => {
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
          {/* Chart bars */}
          <path
            d="M6 20V10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 20V4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M18 20V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* AI Spark circle */}
          <circle
            cx="12"
            cy="4"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
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
          <rect
            x="5"
            y="10"
            width="2"
            height="10"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
          <rect
            x="11"
            y="4"
            width="2"
            height="16"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
          <rect
            x="17"
            y="14"
            width="2"
            height="6"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="4"
            r="2.5"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
          />
        </svg>
      )}
    </>
  );
};

export default IconAIMarketingAnalytics;
