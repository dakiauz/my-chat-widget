import React from 'react';
import CheckoutForm, { ICheckoutFormProp } from '../forms/CheckoutForm';

function CheckoutCard({ selectedPlanId }: ICheckoutFormProp) {
    return (
        <>
            <CheckoutForm selectedPlanId={selectedPlanId} />
        </>
    );
}

export default CheckoutCard;
