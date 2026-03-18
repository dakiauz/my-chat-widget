import { FC, lazy, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { Field, Form, Formik, useFormik } from 'formik';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { IRootState } from '../../../store';
import useNavigateWithFrom from '../../../shared/hooks/useNavigateWithFrom';
import { addAlert, removeAlert } from '../../../slices/systemAlertSlice';
import IconCheck from '../../../../_theme/components/Icon/IconCheck';
import FormGroup from '../../../shared/components/forms/FormGroup';
import FormLabel from '../../../shared/components/forms/FormLabel';
import FormInput from '../../../shared/components/forms/FormInput';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import countryData from '../../../shared/data/countryData';
import { Select } from '@mantine/core';
import { useCreateSubscriptionMutation } from '../services/subscriptionApi';
import { createdSubscription, loginSuccess } from '@/app/slices/authSlice';
import { useGetUserMutation } from '../../Authentication/services/authApi';
import { IAuthResponse } from '../../Authentication/models/auth';

export interface ICheckoutFormProp {
    selectedPlanId: number;
}

export default function CheckoutForm({ selectedPlanId }: ICheckoutFormProp) {
    const state = useSelector((state: IRootState) => state.auth);
    const [createSubscription, { isLoading, isError, error, data, status }] = useCreateSubscriptionMutation();
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigateWithFrom();
    const [authData] = useGetUserMutation();
    const auth = useSelector((state: IRootState) => state.auth);

    const cardStyle = {
        base: {
            width: '100%',
            color: '#32325d',
            fontFamily: 'Arial, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '300px',
            border: '1px solid #ccc', // Add a border
            '::placeholder': {
                color: '#aab7c4',
            },
            margin: '0',
            paddin: '0',
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
        },
        showIcon: true,
    };

    const validation = useFormik({
        validateOnBlur: false,
        initialValues: {
            country: '',
            zip: '',
        },
        validationSchema: Yup.object({}),
        onSubmit: async (values) => {
            dispatch(removeAlert());

            const { paymentMethod, error } = await (stripe as any).createPaymentMethod({
                type: 'card',
                card: (elements as any).getElement(CardNumberElement),
            });

            const credentials: any = {
                plan: selectedPlanId ?? 0,
                stripeToken: paymentMethod.id,
            };
            try {
                await createSubscription(credentials)
                    .unwrap()
                    .then((response: any) => {
                        if (response.success) {
                            dispatch(createdSubscription(response?.data));
                            authData(auth.token ?? '')
                                .unwrap()
                                .then((res: IAuthResponse) => {
                                    if (res.success) {
                                        let userData = {
                                            user: {
                                                ...res.data,
                                            },
                                            token: auth.token,
                                        };
                                        dispatch(loginSuccess(userData));
                                    } else {
                                        navigate('/logout');
                                    }
                                })
                                .catch((error: any) => {
                                    navigate('/logout');
                                });
                            navigate('/dashboard');
                            showNotification({
                                title: 'Success!',
                                message: response.message ?? 'Subscription created successfully',
                                color: 'teal',
                                icon: <IconCheck />,
                            });
                        } else {
                            dispatch(addAlert({ message: response.message, variant: 'warning', title: 'Warning!' }));
                        }
                    })
                    .catch((error: any) => {
                        if (error?.status) {
                            dispatch(addAlert({ message: error?.data?.error, variant: 'warning', title: 'Warning!' }));
                        }
                    })
                    .finally(() => {
                        validation.setSubmitting(false);
                    });
            } catch (error) {
                console.error('Checkout Page', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                });
            }
        },
    });

    const [cardFocused, setCardFocused] = useState([false, false, false]);

    const countryError = validation.touched.country && validation.errors.country;
    const zipError = validation.touched.zip && validation.errors.zip;

    return (
        <div className="space-y-5 dark:text-white">
            <form className="!font-inter grid grid-cols-12 gap-4" onSubmit={validation.handleSubmit}>
                <FormGroup className={`col-span-12 lg:col-span-12 md:col-span-12 !mb-0 `}>
                    <FormLabel required htmlFor="cardNumber">
                        Card number
                    </FormLabel>
                    <div className="grid col-span-1 ">
                        <CardNumberElement
                            id="cardNumber"
                            className={`placeholder:text-white-dark form-input placeholder:!font-inter ${cardFocused[0] ? 'border-black/60' : ''}`}
                            options={cardStyle}
                            onFocus={() => setCardFocused([true, false, false])}
                            onBlur={() => setCardFocused([false, false, false])}
                        />
                    </div>
                </FormGroup>

                <FormGroup className={`col-span-12 lg:col-span-6 md:col-span-6 !mb-0 `}>
                    <FormLabel required htmlFor="cardExpiry">
                        Expiry
                    </FormLabel>
                    <CardExpiryElement
                        id="cardExpiry"
                        className={`placeholder:text-white-dark form-input placeholder:!font-inter ${cardFocused[1] ? 'border-black/60' : ''}`}
                        onFocus={() => setCardFocused([false, true, false])}
                        onBlur={() => setCardFocused([false, false, false])}
                    />
                </FormGroup>

                <FormGroup className={`col-span-12 lg:col-span-6 md:col-span-6 !mb-0 `}>
                    <FormLabel required htmlFor="cardCvc">
                        CVC
                    </FormLabel>
                    <CardCvcElement
                        id="cardCvc"
                        className={`placeholder:text-white-dark form-input placeholder:!font-inter ${cardFocused[2] ? 'border-black/60' : ''}`}
                        onFocus={() => setCardFocused([false, false, true])}
                        onBlur={() => setCardFocused([false, false, false])}
                    />
                </FormGroup>

                <button
                    disabled={validation.isSubmitting}
                    type="submit"
                    className="col-span-12 inline-flex !mt-6 w-full btn bg-brand text-white h-8 gap-1  items-center justify-center p-0 transition ring-inset ring-white/50 shadow-none dark:shadow-md dark:hover:!shadow-white lg:hover:ring-1 py-6 "
                >
                    {validation.isSubmitting ? (
                        <>
                            <span className="animate-ping w-3 h-3 ltr:mr-4 rtl:ml-4 inline-block rounded-full  bg-white"></span>
                            <span className="pr-10">Please Wait</span>
                        </>
                    ) : (
                        'Checkout'
                    )}
                </button>
            </form>
        </div>
    );
}
