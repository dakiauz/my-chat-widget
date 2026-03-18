import { Skeleton } from '@mantine/core';
import React, { useState, useEffect } from 'react';

interface LazyImageProps {
    src: string;
    alt?: string;
    className: string;
    timeout?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, timeout = 0 }) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setTimeout(() => {
                setLoaded(true);
            }, timeout);
        };
    }, [src]);

    return (
        <div className={className}>
            {!loaded && <Skeleton className={className}></Skeleton>}
            {loaded && <img src={src} alt={alt} className={className} />}
        </div>
    );
};

export default LazyImage;
