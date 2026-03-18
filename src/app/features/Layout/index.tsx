import { FC, PropsWithChildren, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Header from '../../../_theme/components/Layouts/Header/Header';
import Sidebar from '../../../_theme/components/Layouts/Sidebar';
import Portals from '../../../_theme/components/Portals';
import { toggleSidebar } from '../../../_theme/themeConfigSlice';
import ClearEatsSuspenseLoader from '../../shared/components/ui/loaders/ClearEatsSuspenseLoader';
import { IRootState } from '../../store';
import Footer from '../../../_theme/components/Layouts/Footer';
import { FloatingDialer } from '../Calls/components/floating/floating-dialer';
import { FloatingActionButtons } from '../Calls/components/floating/floating-action-buttons';
import { useGetIntegrationsQuery } from '../Integrations/services/IntegrationApi';
import { hasRole } from '../../shared/utils/utils';

function index({ children }: PropsWithChildren): ReturnType<FC> {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    const [showLoader, setShowLoader] = useState<boolean | undefined>();
    const [showTopButton, setShowTopButton] = useState(false);

    const goToTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    const onScrollHandler = () => {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            setShowTopButton(true);
        } else {
            setShowTopButton(false);
        }
    };

    const CloseLoader = () => {
        useLayoutEffect(() => {
            setShowLoader(true);
            return () => {
                setShowLoader(false);
            };
        }, []);

        return <ClearEatsSuspenseLoader message="Downloading Resources" show={true} />;
    };

    useEffect(() => {
        window.addEventListener('scroll', onScrollHandler);
        return () => {
            window.removeEventListener('onscroll', onScrollHandler);
        };
    }, []);

    const phoneNumber = useSelector((state: IRootState) => state.auth.user?.twilio_phone_number?.phoneNumber);
    const auth = useSelector((state: IRootState) => state.auth);

    const makeCallPermission = useMemo(() => {
        return hasRole('Make Call', true && phoneNumber, auth);
    }, [auth, phoneNumber]);

    return (
        <>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                {/* sidebar menu overlay */}
                <div className={`${(!themeConfig.sidebar && 'hidden') || ''} fixed inset-0 bg-[black]/60 z-50 lg:hidden`} onClick={() => dispatch(toggleSidebar())}></div>
                {/* screen loader */}
                <ClearEatsSuspenseLoader show={showLoader} />
                <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50">
                    {showTopButton && (
                        <button type="button" className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary" onClick={goToTop}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                            </svg>
                        </button>
                    )}
                </div>
                {/* BEGIN APP SETTING LAUNCHER */}
                {/* <Setting /> */}
                {/* END APP SETTING LAUNCHER */}

                <div className={`${themeConfig.navbar} main-container text-black dark:text-white-dark min-h-screen bg-[#F4F4F4]`}>
                    {/* BEGIN SIDEBAR */}
                    <Sidebar />
                    {/* END SIDEBAR */}

                    <div className="main-content flex flex-col min-h-screen">
                        {/* BEGIN TOP NAVBAR */}
                        <Header />
                        {/* END TOP NAVBAR */}

                        {/* BEGIN CONTENT AREA */}
                        <Suspense fallback={<CloseLoader />}>
                            <div className={`${themeConfig.animation} p-0 animate__animated bg-[#F4F4F4] `}>
                                {children}
                                <Outlet />
                            </div>
                        </Suspense>
                        {/* END CONTENT AREA */}

                        {/* BEGIN FOOTER */}
                        {/* Floating Components */}
                        {makeCallPermission && (
                            <>
                                <FloatingDialer />
                                <FloatingActionButtons />
                            </>
                        )}

                        {/* <Footer /> */}
                        {/* END FOOTER */}
                        <Portals />
                    </div>
                </div>
            </div>
        </>
    );
}
export default index;
