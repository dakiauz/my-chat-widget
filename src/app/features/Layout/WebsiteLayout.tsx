import React, { FC, PropsWithChildren } from 'react';

import backgroundMesh from '/assets/images/backgroundMesh.png';
import loginBg from '/assets/images/LoginBg.png';

function WebsiteLayout({ children }: PropsWithChildren): ReturnType<FC> {
    return (
        <>
            <div
                className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `url(${backgroundMesh})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: 'auto',
                }}
            ></div>
            <main
                className=" relative h-[40%] bg-no-repeat bg-top bg-contain flex flex-col gap-8 sm:gap-16 font-montserrat"
                id="HeroSection"
                style={{
                    backgroundImage: `url(${loginBg})`,
                }}
            >
                {children}
            </main>
        </>
    );
}

export default WebsiteLayout;
