import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import ISidebarMenuType from './types';
import { FaCrown } from 'react-icons/fa';

const SidebarItem: FC<ISidebarMenuType['SidebarItemProps']> = ({ title, Icon, path, premium, disabled }) => {
    const iconClassName = 'icon group-hover:!text-white shrink-0';

    if (disabled) {
        // Not wrapped in NavLink -> NOT clickable
        return (
            <li className="nav-item py-2 opacity-50 cursor-not-allowed">
                <div className="flex flex-col">
                    <div className="flex items-center py-1 ml-3">
                        {Icon ? <Icon className={iconClassName} /> : null}
                        <span className="font-montserrat ltr:pl-3  dark:text-gray">{title}</span>
                    
                    </div>
                    <span className="text-[0.65rem] text-gray-400 pl-12">Coming soon</span>
                </div>
            </li>
        );
    }

    return (
        <li className="nav-item py-1">
            <NavLink to={path} className="group">
                <button
                    disabled={premium}
                    className="flex items-center justify-between py-1 w-full disabled:opacity-50 disabled:hover:cursor-not-allowed"
                >
                    <div className="flex items-center">
                        {Icon ? <Icon className={iconClassName} /> : null}
                        <span className="font-montserrat ltr:pl-3 rtl:pr-3 dark:text-gray group-hover:text-white">{title}</span>
                    </div>
                    {premium && <FaCrown className="!text-yellow-500 w-[1.1rem] h-[1.1rem]" />}
                </button>
            </NavLink>
        </li>
    );
};

export default SidebarItem;
