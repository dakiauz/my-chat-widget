import { useEffect, useState } from 'react';
import LazyImage from '../../LazyImage';

interface ILoaderProps {
    show: boolean | undefined;
    message?: string;
}

function ClearEatsSuspenseLoader(props: ILoaderProps): JSX.Element {
    const { show, message } = props;
    const [showLoader, setShowLoader] = useState(false);
    useEffect(() => {
        if (show == true) {
            setShowLoader(true);
            return;
        } else if (show == false) {
            const screenLoader = document.getElementsByClassName('screen_loader');
            if (screenLoader?.length) {
                screenLoader[0].classList.add('animate__fadeOut');
                setTimeout(() => {
                    setShowLoader(false);
                }, 1000);
            }
        }
    }, [show]);

    return (
        <>
            {/* screen loader */}
            {showLoader && (
                <div className="screen_loader  fixed inset-0 bg-[#060818]/40 dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <div className="flex flex-col justify-center items-center gap-2">
                        <LazyImage className="animate object-scale-down w-28" src="/assets/favicon.png" alt="loader" />
                        <div className="text-white text-center font-semibold text-sm">{message ?? 'Loading...'}</div>
                        <LazyImage
                            className="animate animate__animated animate__infinite animate-spin animate object-scale-down w-7 "
                            src="/assets/brand-logos/loaderSpinner.png"
                            alt="loader"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default ClearEatsSuspenseLoader;
