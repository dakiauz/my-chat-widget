import { useEffect, useState } from 'react';
import LazyImage from '../../LazyImage';
import ClearEatsLoaderMessage from './ClearEatsLoaderMessage';
const defaultLayoutBg = '/assets/images/Dakia logo.png';

interface ILoaderProps {
    show?: boolean | undefined;
    loaderBgImage?: string | null;
    loaderText?: string;
    loading?: boolean;
    className?: string;
    backgroundColor?: string | null;
    loaderLogo?: string | null;
}

function ClearEatsSplashLoader({ show = true, loaderBgImage, loaderText, loading, className, backgroundColor, loaderLogo }: ILoaderProps): JSX.Element {
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
            <div
                style={{
                    backgroundImage: `url(${loaderBgImage || defaultLayoutBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mixBlendMode: 'multiply',
                }}
                className={`${className} screen_loader  fixed inset-0 grid place-content-center animate__animated`}
            >
                <div style={{ backgroundColor: `${backgroundColor}D1` }} className="screen_loader  fixed inset-0 bg-blue dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    {showLoader && (
                        <div className="flex flex-col justify-center items-center gap-2">
                            {loaderLogo && loaderLogo != 'null' ? (
                                <LazyImage className="animate object-scale-down w-28" src={loaderLogo} />
                            ) : loaderLogo == undefined ? (
                                <LazyImage className="animate object-scale-down w-28" src="/assets/images/Dakia logo.png" />
                            ) : null}

                            <ClearEatsLoaderMessage loaderText={loaderText} loading={loading} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ClearEatsSplashLoader;
