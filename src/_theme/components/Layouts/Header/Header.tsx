import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LazyImage from '../../../../app/shared/components/LazyImage';
import { IRootState } from '../../../../app/store';
import DemoBar from './DemoBar';
import ProfileMenu from './ProfileMenu';
import SidebarToggler from './SidebarToggler';
import { Select } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const dispatch = useDispatch();
    const sidebar = useSelector((state: IRootState) => state.themeConfig.sidebar);
    const navigate = useNavigate();
    const [isDemo, setIsDemo] = useState<boolean>(localStorage.getItem('demo') != 'true');

    // ✅ Get user from Redux (assuming auth slice)
    const user = useSelector((state: IRootState) => state.auth.user);

    const handleJoinProClick = () => {
        navigate('/update-subscription');
    };

    // ✅ Check if user already has Premium plan
    const isPremiumUser =
        user?.company?.subscription?.name?.toLowerCase().includes('premium');

    return (
        <nav className="font-inter">
            {false && <DemoBar />}
            <div className="flex justify-between bg-white border-none items-center px-4 shadow-none">
                <div className="h-16 flex items-center">
                    <div>{<SidebarToggler />}</div>

                    {/* Search Bar */}
                    <div className="hidden sm:block ml-4">
                        <Select placeholder="Search..." data={[]} nothingFound="Coming soon!" />
                    </div>
                </div>

                {/* Profile Menu Section */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* ✅ Show Join Pro button only if NOT Premium */}
                    {!isPremiumUser && (
                        <button
                            className="bg-[#E7D9FF] text-brand font-semibold py-2 px-3 sm:py-3 sm:px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center gap-1 sm:gap-2"
                            onClick={handleJoinProClick}
                        >
                            <img
                                src="/assets/images/Diamond.png"
                                alt="Diamond icon"
                                className="h-5 w-5 sm:h-6 sm:w-6"
                            />
                            <span className="hidden sm:inline">Join Pro</span>
                        </button>
                    )}

                    <ProfileMenu />
                </div>
            </div>
        </nav>
    );
};

export default Header;
