import React from 'react';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import { NavLink } from 'react-router-dom';
import ISidebarMenuType from './types';
import { FaCrown } from 'react-icons/fa';

function SidebarMultimenu({ currentMenu, toggleMenu, title, Icon, items, premium }: ISidebarMenuType['SidebarMultimenuProps'] & { premium?: boolean }) {
    const iconClassName = 'icon group-hover:!text-white  shrink-0';

    type ItemType = {
        title: string;
        path: string;
        premium?: boolean;
    };

    return (
        <li className="menu nav-item">
            <button
                type="button"
                className={`${currentMenu === title ? 'active' : ''} nav-link group w-full ${premium ? 'disabled:opacity-50 disabled:hover:cursor-not-allowed' : ''}`}
                onClick={() => toggleMenu(title)}
                disabled={premium} // Added `disabled` prop to the main button
            >
                <div className="flex items-center">
                    <Icon className={iconClassName} />
                    <span className="ltr:pl-3 rtl:pr-3  dark:text-[#506690] dark:group-hover:text-white-dark">{title}</span>
                </div>
                {premium && <FaCrown className="!text-yellow-500 w-[1.1rem] h-[1.1rem]" />}

                <div className={currentMenu !== title ? 'rtl:rotate-90 -rotate-90' : ''}>
                    <IconCaretDown />
                </div>
            </button>

            <AnimateHeight duration={300} height={currentMenu === title ? 'auto' : 0}>
                <ul className="sub-menu text-gray-500">
                    {items.map((item: ItemType, index: number) => {
                        if (!item) return null;
                        return (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    className={'!pr-[0.65rem]'}
                                    onClick={(e) => { // Added `onClick` handler to prevent navigation
                                        if (item.premium) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <div className={`flex items-center w-full ${item.premium ? 'opacity-50  hover:cursor-not-allowed' : ''}`}>
                                        <div className="flex items-center w-full">
                                            <span className="font-montserrat ltr:pl-3 rtl:pr-3  dark:text-gray group-hover:text-white">{item.title}</span>
                                        </div>
                                        {item.premium && <FaCrown className="!text-yellow-500 w-6 h-6" />}
                                    </div>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </AnimateHeight>
        </li>
    );
}

export default SidebarMultimenu;