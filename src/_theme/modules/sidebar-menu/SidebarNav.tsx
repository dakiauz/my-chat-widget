import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import IconMenuChat from '../../components/Icon/Menu/IconMenuChat';
import { toggleSidebar } from '../../themeConfigSlice';
import IconCaretsDown from '../../components/Icon/IconCaretsDown';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../app/store';

type PropsType = {
    children: React.ReactNode;
};

const SidebarNav: FC<PropsType> = (props: PropsType) => {
    const { children } = props;
    const dispatch = useDispatch();
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[1px_0_2px_0_rgba(94,92,154,0.05)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full">
                    <div className="flex justify-center items-center px-4 py-[0.69rem]">
                        <NavLink to="/analytics" className="main-logo flex items-center justify-center shrink-0">
                            <img className=" object-scale-down w-36 pr-4 my-2 mb-6" src={!isDark ? '/assets/images/Dakia logo.png' : '/assets/images/Dakia logo.png'} alt="logo" />
                        </NavLink>

                        {/* <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button> */}
                    </div>
                    {children}
                </div>
            </nav>
        </div>
    );
};

export default SidebarNav;
