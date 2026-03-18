import React, { FC } from 'react';
import ProfileMenu from './ProfileMenu';

const DemoBar: FC = () => {
    return (
        <div id="demoBar" className="bg-secondary">
            <div className="mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex flex-wrap py-3 items-center justify-between gap-3">
                    <div className="flex items-end justify-start gap-5">
                        <div className="flex flex-shrink-0 items-center">
                            <img className="h-10 w-auto" src="/assets/brand-logos/favicon-light.png" alt="Clear Eats" />
                        </div>
                        <a href="" className="text-danger-light font-semibold">
                            Live Demo
                        </a>
                    </div>
                    <div className="flex items-center pr-2 ml-auto">
                        <button className="font-semibold py-2 px-4 rounded-md w-52 h-10 text-md bg-white text-secondary">Buy Now!</button>
                        <ProfileMenu />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoBar;
