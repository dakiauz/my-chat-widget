// src/components/UpdateSubscription.tsx
import React, { FC, useMemo, useState, useEffect } from 'react';
import { useGetPlansQuery, useUpdateSubscriptionMutation } from '../../features/Subscription/services/subscriptionApi';
import { useGetUserByTokenQuery} from '../../features/Authentication/services/authApi';
import { showNotification } from '@mantine/notifications';
import { Loader } from '@mantine/core';
import Header from '@/app/shared/components/nav-bar/Header';
import Footer from '@/app/shared/components/nav-bar/Footer';
import { IRootState } from '@/app/store';

// Unchanged components
interface LoadingOverlayProps {
  visible: boolean;
  children: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, children }) => (
  <div className="relative">
    {visible && (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-purple-500"></div>
      </div>
    )}
    {children}
  </div>
);

interface ClearEatsSplashLoaderProps {
  show: boolean;
}

const ClearEatsSplashLoader: React.FC<ClearEatsSplashLoaderProps> = ({ show }) => (
  show ? (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">Loading Plans...</h1>
        <div className="animate-pulse text-md text-gray-500">Please wait</div>
      </div>
    </div>
  ) : null
);

// Main component with the fix
const UpdateSubscription = () => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
  const { data: userData, isLoading: userLoading } = useGetUserByTokenQuery();

  const user = userData?.data;
  const { data: plansData, isLoading: plansLoading, error: plansError } = useGetPlansQuery();
  const plans = plansData?.plans ?? [];

  const currentPlan = useMemo(() => {
    if (!user?.company?.subscription?.name || !plans.length) return null;
    return plans.find(plan => plan.name === user.company.subscription.name);
  }, [user, plans]);

  const hasActiveSubscription = !!currentPlan;
  const filteredPlans = useMemo(() => plans.filter((plan) => plan.interval === period), [plans, period]);
  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId), [plans, selectedPlanId]);
  
  // This useEffect synchronizes the selected plan with the user's current subscription
  useEffect(() => {
    if (currentPlan) {
      setSelectedPlanId(currentPlan.id);
      setPeriod(currentPlan.interval);
    }
  }, [currentPlan]);

  // Handle period change: reset selected plan to the first one in the new period
  const handlePeriodChange = (newPeriod: 'monthly' | 'yearly') => {
    setPeriod(newPeriod);
    const firstPlanInNewPeriod = plans.find(plan => plan.interval === newPeriod);
    if (firstPlanInNewPeriod) {
      setSelectedPlanId(firstPlanInNewPeriod.id);
    }
  };

  const handleSubscriptionAction = async () => {
    if (!selectedPlanId) return;

    try {
      // RTK Query's invalidatesTags handles the refetching, no need for manual refetch.
      const response = await updateSubscription({ plan_id: selectedPlanId }).unwrap();
      if (response.success) {
        showNotification({
          title: 'Success',
          message: 'Subscription updated successfully!',
          color: 'green',
        });
      } else {
        showNotification({
          title: 'Error',
          message: response.message || 'Failed to update subscription.',
          color: 'red',
        });
      }
    } catch (err: any) {
      showNotification({
        title: 'Error',
        message: err.data?.message || 'Something went wrong.',
        color: 'red',
      });
    }
  };

  const isInitialPlanSelected = selectedPlanId === currentPlan?.id;
  const isButtonDisabled = isUpdating || isInitialPlanSelected;
  
  if (plansLoading || userLoading) {
    return <ClearEatsSplashLoader show={true} />;
  }

  if (plansError) {
    console.error('Error fetching plans:', plansError);
    return <div className="text-center text-red-500 py-4">Error loading plans</div>;
  }
  
  const mainTitle = hasActiveSubscription ? 'Update Subscription' : 'Select a Plan';
  const mainDescription = hasActiveSubscription
    ? 'Ready to upgrade or downgrade your plan? Select a new plan from the options on the left to change your subscription.'
    : 'You currently have no active subscription. Choose a plan to get started and unlock all features.';
  const buttonText = isUpdating
    ? 'Processing...'
    : hasActiveSubscription
    ? 'Update Subscription'
    : 'Subscribe Now';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 py-12 mt-10 md:mt-20 container mx-auto gap-10 lg:gap-5 font-inter">
          <div className="col-span-1 md:col-span-1 lg:col-span-7 flex flex-col justify-center items-center lg:items-start h-full w-full px-4 lg:px-0">
            <div className="flex flex-col justify-center items-center lg:items-start gap-2 xl:gap-4 relative w-full text-center lg:text-left">
              <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">Pricing</span>
              <h1 className="text-2xl sm:text-xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                {hasActiveSubscription ? 'Crush your sales quota with Dakia.' : 'Choose the right plan for you.'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-lg mt-2">
                Dakia.ai helps you scale your outreach campaigns through unlimited email sending accounts, unlimited warmup, and smart AI.
              </p>

              <div className="flex rounded-full bg-white border-purple-600 border font-inter text-sm mt-8 shadow-sm">
                <button
                  className={`py-2 rounded-full font-semibold transition-colors px-8 flex items-center gap-2 ${
                    period === 'monthly' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border-purple-600'
                  }`}
                  onClick={() => handlePeriodChange('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`py-2 rounded-full font-semibold transition-colors px-8 ${
                    period === 'yearly' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border-purple-600'
                  }`}
                  onClick={() => handlePeriodChange('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col justify-center gap-4 mt-8">
              {filteredPlans.map((card) => {
                const isSelected = selectedPlanId === card.id;
                const isCurrentPlan = hasActiveSubscription && currentPlan?.id === card.id;
                return (
                  <button
                    onClick={() => {
                      if (!isCurrentPlan) {
                        setSelectedPlanId(card.id);
                      }
                    }}
                    key={card.id}
                    className={`w-full rounded-2xl shadow-xl p-6 md:p-8 font-inter text-gray-800 transition-transform duration-300 transform hover:scale-[1.01] border-[4px] ${
                      isSelected ? 'border-purple-400 bg-white' : 'bg-white border-transparent'
                    } ${isCurrentPlan ? 'cursor-default opacity-75' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex flex-col items-start">
                        <h2 className={`text-xl font-bold mb-1 ${isSelected ? 'text-purple-600' : 'text-gray-800'}`}>
                          {card.name}
                        </h2>
                        {isCurrentPlan && (
                          <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                            Current Plan
                          </span>
                        )}
                        <p className="text-sm leading-snug text-gray-600 text-left">{card.description}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-start sm:items-end mt-4 sm:mt-0">
                        <p className={`font-bold text-2xl ${isSelected ? 'text-purple-600' : 'text-gray-800'}`}>
                          ${card.price}
                          <span className="text-base text-gray-500 font-normal">/{card.interval}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {card.interval === 'yearly' ? `Billed yearly at $${card.price}` : `Billed monthly at $${card.price}`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-5 relative px-4 lg:px-0">
            <div className="rounded-2xl p-6 md:p-8 bg-white shadow-md flex flex-col sticky top-20">
              <div className="flex gap-1 flex-col">
                <h3 className="text-purple-600 font-bold text-2xl">Plan Details</h3>
              </div>
              <div className="border-t border-gray-200 mt-6 pt-6">
                {userLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader size="lg" color="purple" />
                  </div>
                ) : (
                  hasActiveSubscription ? (
                    <>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">Your Current Plan</h4>
                      <div className="flex justify-between items-center text-md font-medium">
                        <span>Plan:</span>
                        <span className="text-purple-600">{currentPlan.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-md font-medium">
                        <span>Price:</span>
                        <span className="text-purple-600">
                          ${currentPlan.price}/{currentPlan.interval}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No active subscription found. Select a plan to continue.</p>
                  )
                )}
              </div>

              {userLoading ? (
                <div className="border-t border-gray-200 mt-6 pt-6 min-h-[100px] flex justify-center items-center">
                  <Loader size="lg" color="purple" />
                </div>
              ) : (
                selectedPlanId && selectedPlan && selectedPlanId !== currentPlan?.id && (
                  <div className="border-t border-gray-200 mt-6 pt-6 min-h-[100px]">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Your New Plan</h4>
                    <p className="text-md text-gray-600">You are about to subscribe to the {selectedPlan.name}.</p>
                    <div className="flex justify-between items-center text-md font-medium mt-4">
                      <span>Plan:</span>
                      <span className="text-purple-600">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-md font-medium">
                      <span>Price:</span>
                      <span className="text-purple-600">${selectedPlan.price}/{selectedPlan.interval}</span>
                    </div>
                  </div>
                )
              )}

              <LoadingOverlay visible={isUpdating}>
                <div className="mt-6">
                  {selectedPlanId && (
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={handleSubscriptionAction}
                        disabled={isButtonDisabled}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors duration-300 ${
                          isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {isUpdating ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader size="xs" color="white" /> Processing...
                          </span>
                        ) : (
                          buttonText
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </LoadingOverlay>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdateSubscription;