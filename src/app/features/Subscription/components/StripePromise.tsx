import React, { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import { Elements } from '@stripe/react-stripe-js';
import ClearEatsLoaderMessage from '../../../shared/components/ui/loaders/ClearEatsLoaderMessage';
import ClearEatsSplashLoader from '../../../shared/components/ui/loaders/ClearEatsSplashLoader';

function StripePromise(props: any) {
    //
    const [initStripe, setInitStripe] = useState({
        load: false,
        error: null,
        data: null,
    });

    //Resolve Stripe Payment Promise
    useMemo(async () => {
        if (initStripe.load) return;
        //Simulate Stripe Load in 3sec using timeout
        // setTimeout(async () => {
        await loadStripe(import.meta.env.VITE_STRIPE_KEY)
            .then((res) => {
                //Stripe Loaded SuccessFully and saving res in state
                setInitStripe((s: any) => {
                    return { ...s, load: true, error: null, data: res };
                });
            })
            .catch((e) => {
                //Fix where the catching error casuse infinite catch loop
                if (initStripe.error) return;
                //Stripe Failed to load
                setInitStripe((s: any) => {
                    return {
                        ...s,
                        load: false,
                        error: 'Stripe failed to load! Please try again later',
                    };
                });
            })
            .finally(() => {});
        // }, 100000);
    }, []);
    return (
        <>
            {!initStripe.load ? (
                <div style={{ height: 'inherit' }} className="align-self-stretch d-flex justify-content-center align-items-center">
                    <div className="d-flex flex-row flex-wrap gap-2">
                        {initStripe.error ? (
                            <ClearEatsLoaderMessage loaderText="initStripe.error" loading={false} />
                        ) : (
                            <ClearEatsSplashLoader loaderText="Setting up secure connection to continue payment process" loading={true} />
                        )}
                    </div>
                </div>
            ) : (
                <Elements stripe={initStripe.data}>{props.children}</Elements>
            )}
        </>
    );
}

export default StripePromise;
