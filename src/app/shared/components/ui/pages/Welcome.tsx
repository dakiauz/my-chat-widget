import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../../../_theme/themeConfigSlice';
import { IRootState } from '../../../../store';
import useNavigateWithFrom from '../../../hooks/useNavigateWithFrom';
import LazyImage from '../../LazyImage';

const Welcome = () => {
    const dispatch = useDispatch();
    const navigate = useNavigateWithFrom();
    useEffect(() => {
        dispatch(setPageTitle('Welcome'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    return (
        <div className="h-[calc(100vh-50px)] min-h-[350px]  flex bg-white-light  ">
            <div className="relative flex w-full justify-center items-center">
                <LazyImage className="object-scale-down w-[50vw] max-w-[400px] " src={!isDark ? '/assets/images/Dakia logo.png' : '/assets/images/Dakia logo.png'} alt="maintenence" />
            </div>
            <div className="font-semibold dark:text-white">
                {/* <h2 className="text-3xl font-bold text-black lg:text-5xl xl:text-6xl">Welcome to Clear Eats</h2> */}
                <h4 className="mb-7 text-xl sm:text-2xl">Welcome V3_ Testing</h4>
                <p className="text-base">
                    <br className="hidden sm:block" />
                    <br />
                    <br />
                </p>
            </div>
        </div>
    );
};

export default Welcome;

// before:container before:absolute before:left-1/2 before:-translate-x-1/2 before:rounded-full before:bg-[linear-gradient(180deg,#4361EE_0%,rgba(67,97,238,0)_50.73%)] before:aspect-square before:opacity-10 md:py-20
