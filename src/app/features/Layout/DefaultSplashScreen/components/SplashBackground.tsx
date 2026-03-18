import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';

const defaultLayoutBg = '../../../../../../assets/images/DashboardLogo.png';

function SplashBackground({ children, hidden = true }: { children: ReactNode; hidden?: boolean }): ReturnType<FC> {
    const auth = useSelector((state: IRootState) => state.auth);
    const show = useMemo(() => {
        return Boolean(auth.loading && hidden);
    }, [auth.loading, hidden]);

    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        if (show == true) {
            setShowLoader(true);
            return;
        } else if (show == false) {
            const screenLoader = document.getElementsByClassName('splashBackground');
            if (screenLoader?.length) {
                screenLoader[0].classList.add('animate__fadeIn');
                setTimeout(() => {
                    setShowLoader(false);
                }, 1000);
            }
        }
    }, [show]);
    const backgroundImageUrl =
        'https://s3-alpha-sig.figma.com/img/0e32/2817/da3eb8659645697c8fca09493ec17e71?Expires=1722816000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=EIoHG2aIKDSxiYfz7cMnR7VGZ7okTFZE~8wkRuMJl-U0B5-cvuxES1T~HJ3j458vMQEmUw5PyI~VOzQICLMTipPyT7GFlD79V03hBkAH38zaej1rLBWfKs7rhT-qoeXsjN8ucwFo-3uwbqEmIExUSgPT6taVuGw10nlpSrrq9UzXVrio5~M5Tmws~c3qZxc~qI-7lCy9JZukwpjM1q5MqnAackTRVIrLDBHiLjc~GqrFP9bjZjO0y4cRl5WjdKfIVTU7N4KHi4ZGzpiuoqL2cguDBaVX~FbkdSjp8PEs024rXu~nGkCGuZCxTusQe9~iGAi-sAttno0~ymwEZNPHkw__';

    return (
        <div className="bg-white">
            {!showLoader && (
                <div
                    style={{
                        backgroundImage: `url(${defaultLayoutBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'multiply',
                    }}
                    className={` ${auth.loading && hidden ? '  ' : ''} relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat `}
                >
                    <div className=" relative flex w-full h-full min-h-screen flex-col justify-center items-center  bg-blue/45">
                        <div className="splashBackground w-full animate__animated">{children}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SplashBackground;
