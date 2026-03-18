import React from 'react';
import IconMinus from '../../components/Icon/IconMinus';
import ISidebarMenuType from './types';

function SidearHeading({ title }: ISidebarMenuType['SidebarMenuHeadingProps']) {
    return (
        <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
            <IconMinus className="w-4 h-5 flex-none hidden" />
            <span>{title}</span>
        </h2>
    );
}

export default SidearHeading;
