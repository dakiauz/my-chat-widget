import { FC } from 'react';

interface IconWorkflowProps {
  className?: string;
  fill?: boolean;
  duotone?: boolean;
}

const IconWorkflow: FC<IconWorkflowProps> = ({ className, fill = false, duotone = true }) => {
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
          <path
            d="M6 3H10V7H6V3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 3H18V7H14V3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 17H10V21H6V17Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 17H18V21H14V17Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7V17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
          <path
            d="M6 3H10V7H6V3Z"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 3H18V7H14V3Z"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 17H10V21H6V17Z"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 17H18V21H14V17Z"
            fill="currentColor"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7V17"
            stroke={!duotone ? 'white' : 'currentColor'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );
};

export default IconWorkflow;
