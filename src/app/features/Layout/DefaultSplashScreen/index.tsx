import React from 'react';
import SplashBackground from './components/SplashBackground';
import SplashCompanyLogo from './components/SplashCompanyLogo';

interface IDefaultSplashScreenProps {
    children: React.ReactNode;
}

function index({ children }: IDefaultSplashScreenProps) {
    return (
        <SplashBackground>
            <SplashCompanyLogo />
            {children}
        </SplashBackground>
    );
}

export default index;
