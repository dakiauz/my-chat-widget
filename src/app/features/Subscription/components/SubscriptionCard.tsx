import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPlansQuery } from '../services/subscriptionApi';
import ClearEatsSplashLoader from '../../../shared/components/ui/loaders/ClearEatsSplashLoader';

interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
}

const SubscriptionCard: React.FC = () => {
    const { data, error, isLoading } = useGetPlansQuery(undefined);
    const navigate = useNavigate();

    if (isLoading) return <ClearEatsSplashLoader show={true} />;
    if (error) {
        console.error('Error fetching plans:', error);
        return <div className="text-center text-red-500 py-4">Error loading plans</div>;
    }

    const plans = data?.plans ?? [];

    const handleButtonClick = (planId: number, route: string) => {
        localStorage.setItem('selectedPlanId', planId.toString());
        navigate(route);
    };

    const isGoldenPlan = (plan: Plan) => (plans.length == 1 ? true : plan.name === 'Gold Plan');

    return (
        <div className="relative flex w-full flex-col items-center justify-center gap-5 my-5 mt-10">
            <div className=" flex flex-wrap flex-col lg:flex-row gap-6 items-center justify-between">
                {plans.map((plan: Plan) => (
                    <div
                        key={plan.id}
                        className={`flex flex-col p-6 mx-auto max-w-80 h-max bg-white border-4 rounded-xl ${isGoldenPlan(plan) ? 'pt-12  relative bg-cover bg-center' : ''}`}
                        style={isGoldenPlan(plan) ? { backgroundImage: "url('/assets/images/subscription image.png')" } : {}}
                    >
                        {isGoldenPlan(plan) && (
                            <button className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-danger-light font-bold py-2 px-4 rounded-md w-36 h-10 text-sm bg-brand-500 border border-white">
                                Best Deal
                            </button>
                        )}
                        <h3 className={`text-xl font-bold ${isGoldenPlan(plan) ? 'text-danger-light' : ''}`}>{plan.name}</h3>
                        <p className={`mb-2  ${isGoldenPlan(plan) ? 'text-danger-light' : 'text-gray-700'}`}>
                            {/* {plan.description} */}
                            Billed today at
                        </p>
                        <h1 className={`font-bold text-3xl pt-3 mb-2 ${isGoldenPlan(plan) ? 'text-danger-light' : 'text-gray-700'}`}>
                            ${plan.price}
                            <span className="text-lg">/month</span>
                        </h1>
                        <h2 className={`text-lg mb-4 ${isGoldenPlan(plan) ? 'text-danger-light' : 'text-gray-600'}`}>Get our All Premium features</h2>
                        <button
                            onClick={() => handleButtonClick(plan.id, '/register')}
                            className={`font-semibold py-2 px-4 rounded-md w-full  text-lg border ${
                                isGoldenPlan(plan) ? 'bg-brand-500 text-danger-light !font-bold ' : 'text-brand-500 border-brand-500'
                            }`}
                        >
                            {plans.length > 1 && isGoldenPlan(plan) ? 'Get Clear Eats PLUS' : 'Proceed to checkout'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="text-white text-base text-center mt-2">
                <p>Select any payment plan to continue</p>
                {/* <p>We offer both annual and monthly subscriptions. Choose one and proceed to checkout to continue.</p>
                <button className="text-brand-700 font-bold py-2 px-4 rounded-md w-40 h-10 text-lg bg-white mt-3">Have a Tour</button> */}
            </div>
        </div>
    );
};

export default SubscriptionCard;
