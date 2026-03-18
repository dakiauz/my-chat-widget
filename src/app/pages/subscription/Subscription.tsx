import { FC } from 'react';
import SubscriptionCard from '../../features/Subscription/components/SubscriptionCard';
import Header from '@/app/shared/components/nav-bar/Header';
import Footer from '@/app/shared/components/nav-bar/Footer';

function Subscription(): ReturnType<FC> {
    return (
        <>
            <Header />
            <main className="bg-gradient-to-b to-white from-white/0 transition-all duration-75">
                <Footer />
            </main>
        </>
    );
}

export default Subscription;
