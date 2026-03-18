import React from 'react';
import LazyImage from '../../LazyImage';

interface ILoaderProps {
    loaderText?: string;
    loading?: boolean;
}
function ClearEatsLoaderMessage({ loaderText = 'Loading...', loading = true }: ILoaderProps): JSX.Element {
    return (
        <div className="flex flex-col justify-center items-center gap-2">
            <div className="text-white text-center font-semibold text-sm">{loaderText}</div>
            {loading && (
                <LazyImage
                    className="animate animate__animated animate__infinite animate-spin animate object-scale-down w-7 "
                    src="/assets/brand-logos/loaderSpinner.png"
                />
            )}
        </div>
    );
}

export default ClearEatsLoaderMessage;
