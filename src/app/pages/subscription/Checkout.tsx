import { FC, useEffect, useMemo, useState } from 'react';
import DefaultSplashScreen from '../../features/Layout/DefaultSplashScreen';
import CheckoutCard from '../../features/Subscription/components/CheckoutCard';
import StripePromise from '../../features/Subscription/components/StripePromise';
import AuthenticationCard from '../../features/Authentication/components/AuthenticationCard';
import { Box, LoadingOverlay } from '@mantine/core';
import SplashCompanyLogo from '../../features/Layout/DefaultSplashScreen/components/SplashCompanyLogo';
import Header from '@/app/shared/components/nav-bar/Header';
import Footer from '@/app/shared/components/nav-bar/Footer';

import { useNavigate } from 'react-router-dom';
import { useGetPlansQuery } from '@/app/features/Subscription/services/subscriptionApi';
import ClearEatsSplashLoader from '@/app/shared/components/ui/loaders/ClearEatsSplashLoader';

function Checkout(): ReturnType<FC> {
    //Verify Email Address
    const [fakeLoader, setFakeLoader] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setFakeLoader(true);
        }, 2000);
    }, []);

    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const { data, error, isLoading } = useGetPlansQuery();
    const navigate = useNavigate();

    const plans = data?.plans ?? [];
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

    useEffect(() => {
        if (!plans.length) return;
        const localSelectedPlanId = localStorage.getItem('selectedPlanId');
        let localPlan = null;
        if (localSelectedPlanId) {
            localPlan = plans.find((plan) => plan.id === Number(localSelectedPlanId));
            if (localPlan) {
                if (localPlan.interval === 'yearly') {
                    setPeriod('yearly');
                } else if (localPlan.interval === 'monthly' || localPlan.interval === 'month') {
                    setPeriod('monthly');
                }
                setSelectedPlanId(localPlan.id);
                return;
            }
        }
        // Default selection logic
        const filtered = plans.filter((plan) => plan.interval === period);
        const defaultPlan = filtered.find((plan) => plan.name === 'Premium Plan');
        setSelectedPlanId(defaultPlan ? defaultPlan.id : filtered[0]?.id);
    }, [plans]);

    const filteredPlans = useMemo(() => plans.filter((plan) => plan.interval === period), [plans, period]);
    const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId), [plans, selectedPlanId]);

    if (isLoading) return <ClearEatsSplashLoader show={true} />;
    if (error) {
        console.error('Error fetching plans:', error);
        return <div className="text-center text-red-500 py-4">Error loading plans</div>;
    }

    return (
        <>
            <Header />
            <div className="grid grid-cols-12 py-12 mt-[50px] sm:mt-[100px] container gap-5 font-montserrat">
                <div className="col-span-12 sm:col-span-7 flex flex-col justify-center items-start h-full  sm:pt-0 w-full ">
                    <div className="flex flex-col justify-center items-center sm:items-start gap-2 xl:gap-4 relative w-full">
                        <span className="text-primary font-bold text-sm uppercase tracking-[0.15rem] font-inter">Pricing</span>
                        <h1 className="text-2xl sm:text-2xl xl:text-3xl font-bold text-gray-900 capitalize !leading-[2.5rem] xl:!leading-[3.5rem] text-start">Crush your sales quota with Dakia.</h1>
                        <p className="text-sm sm:text-base text-gray-600 w-[90%] text-start max-w-[650px] font-inter">
                            Dakia.ai helps you scale your outreach campaigns through unlimited email sending accounts, unlimited warmup, and smart AI.
                        </p>

                        <div className="flex mb-8 rounded-full bg-white border-primary border font-inter text-ssm mt-5">
                            <button
                                className={`py-2 rounded-full font-semibold transition-colors px-8 flex items-center gap-2 border ${
                                    period === 'monthly' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-white'
                                }`}
                                onClick={() => setPeriod('monthly')}
                            >
                                Monthly
                            </button>
                            <button
                                className={`py-2 rounded-full font-semibold transition-colors border min-w-[130px] ${
                                    period === 'yearly' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-white'
                                }`}
                                onClick={() => setPeriod('yearly')}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                    {/* Pricing Cards Section */}
                    <div className="w-full flex flex-col justify-center gap-4">
                        {filteredPlans.map((card) => {
                            const isSelected = selectedPlanId === card.id;
                            return (
                                <button
                                    onClick={() => setSelectedPlanId(card.id)}
                                    key={card.id}
                                    className={`w-full rounded-2xl shadow-[0px_0px_60px_0px_#0A40321A] p-8 px-6 font-inter text-gray-800 transition-transform duration-300 group border-[4px] ${
                                        isSelected ? 'border-primary/40 bg-white' : 'bg-white border-transparent'
                                    }`}
                                >
                                    <div className="flex justify-between items-end">
                                        <h2 className={`text-xl font-bold mb-1 ${isSelected ? 'text-primary' : 'text-gray-800'}`}>{card.name}</h2>
                                        <div className="flex flex-col gap-1 items-end">
                                            <p className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                                                ${card.price}/{card.interval}
                                            </p>
                                            <p className="text-xsm text-gray-500">{card.interval === 'yearly' ? `Billed yearly at $${card.price}` : `Billed monthly at $${card.price}`}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-snug mb-5 mt-2 text-start">{card.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="col-span-12 sm:col-span-5 relative ">
                    <div className="rounded-xl p-5 bg-white shadow-lg flex flex-col sticky top-[130px]">
                        <div className="flex gap-1 flex-col">
                            <h3 className="text-primary font-bold text-xl ">Selected Package</h3>
                            <p className="font-bold text-lg text-black/80">
                                ${selectedPlan?.price}/{selectedPlan?.interval}
                            </p>
                        </div>
                        <div className="border-t mt-3 pt-3 min-h-[100px]">
                            <p className="text-xsm text-gray-500 flex gap-1">
                                <span>{selectedPlan?.description}</span>
                            </p>
                        </div>
                        <StripePromise>
                            <Box pos="relative">
                                <LoadingOverlay visible={!fakeLoader} zIndex={1000} overlayBlur={1} />
                                {selectedPlanId && <CheckoutCard selectedPlanId={selectedPlanId} />}
                            </Box>
                        </StripePromise>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Checkout;
