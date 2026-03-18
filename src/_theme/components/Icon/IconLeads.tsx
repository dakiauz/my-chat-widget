import { FC } from 'react';

interface IconLeadsProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconLeads: FC<IconLeadsProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M12 2C8.13401 2 5 5.13401 5 9C5 10.4561 5.45477 11.8108 6.23186 12.9504C6.76893 13.7101 7.12524 14.1779 7.25517 14.6935L7.5 15.75L5.79423 19.2203C5.4289 19.9635 6.03668 20.75 6.87981 20.75H17.1202C17.9633 20.75 18.5711 19.9635 18.2058 19.2203L16.5 15.75L16.7448 14.6935C16.8748 14.1779 17.2311 13.7101 17.7681 12.9504C18.5452 11.8108 19 10.4561 19 9C19 5.13401 15.866 2 12 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M12 2C8.13401 2 5 5.13401 5 9C5 10.4561 5.45477 11.8108 6.23186 12.9504C6.76893 13.7101 7.12524 14.1779 7.25517 14.6935L7.5 15.75L5.79423 19.2203C5.4289 19.9635 6.03668 20.75 6.87981 20.75H17.1202C17.9633 20.75 18.5711 19.9635 18.2058 19.2203L16.5 15.75L16.7448 14.6935C16.8748 14.1779 17.2311 13.7101 17.7681 12.9504C18.5452 11.8108 19 10.4561 19 9C19 5.13401 15.866 2 12 2Z"
                        fill="currentColor"
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

export default IconLeads;
