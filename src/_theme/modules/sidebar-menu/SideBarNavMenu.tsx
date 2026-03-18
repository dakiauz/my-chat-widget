import React, { FC } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';

type PropsType = {
    children: React.ReactNode;
};

const SidebarNavMenu: FC<PropsType> = (props: PropsType) => {
    const { children } = props;
    return (
        <PerfectScrollbar className=" h-[calc(100vh-140px)] sm:h-[calc(100vh-80px)] relative">
            <ul className="relative font-semibold space-y-0.5 p-4 py-0  h-full flex flex-col justify-between">{children}</ul>
        </PerfectScrollbar>
    );
};

export default SidebarNavMenu;
