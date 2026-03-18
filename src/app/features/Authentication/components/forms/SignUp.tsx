import { showNotification } from '@mantine/notifications';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import FormInput from '../../../../shared/components/forms/FormInput';
import FormLabel from '../../../../shared/components/forms/FormLabel';
import LazyImage from '../../../../shared/components/LazyImage';
import { loginSuccess } from '../../../../slices/authSlice';
import { useRegisterMutation } from '../../services/authApi';
import { IRegisterPayload } from '../../models/auth';


export default function SignUp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [register, { isLoading, error }] = useRegisterMutation();

    const formik = useFormik<IRegisterPayload & { acceptedTerms: boolean }>({
        // @ts-ignore
        initialValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            acceptedTerms: false,
        },

        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
            acceptedTerms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions').required('Required'),
        }),
        onSubmit: async (values) => {
            try {
                // @ts-ignore
                const response = await register({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    password_confirmation: values.password,
                }).unwrap();

                const token = response?.data?.token;
                if (!token) {
                    showNotification({
                        title: 'Error',
                        message: 'Token not found in response',
                        color: 'red',
                    });
                    return;
                }

                localStorage.setItem('authToken', token);
                dispatch(
                    loginSuccess({
                        user: response.data?.user,
                        token,
                    })
                );

                showNotification({
                    title: 'Success',
                    message: 'User has been registered successfully!',
                    color: 'green',
                });

                navigate('/dashboard');
            } catch (err: any) {
                showNotification({
                    title: 'Registration Failed',
                    message: err?.data?.message ?? 'An error occurred. Please try again.',
                    color: 'red',
                });
            }
        },
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const selectedPlanId = params.get('selectedPlanId');
        if (selectedPlanId) {
            localStorage.setItem('selectedPlanId', selectedPlanId);
        }
    }, []);

    return (
        <div className=" sm:max-h-[2080px]   flex justify-center items-center pt-[50px] flex-grow container">
            <div className="grid sm:grid-cols-2 mt-[20px]">
                <div className="flex flex-col px-16 py-12 w-full flex-1">
                    <h2 className="text-xl text-black-light font-bold font-montserrat mb-6">Sign up to Dakia.ai</h2>
                    <form className="space-y-4 font-inter" onSubmit={formik.handleSubmit}>
                        <div>
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <FormInput variant="filled" id="name" type="text" className="w-full max-w-[27.5rem]" {...formik.getFieldProps('name')} placeholder="Name" required />
                            {formik.touched.name && formik.errors.name && <p className="text-red-500 text-xsm mt-2">{formik.errors.name}</p>}
                        </div>

                        <div>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <FormInput variant="filled" id="email" type="email" className="w-full max-w-[27.5rem]" {...formik.getFieldProps('email')} placeholder="Email" required />
                            {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xsm mt-2">{formik.errors.email}</p>}
                        </div>

                        <div>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <FormInput variant="filled" id="password" type="password" className="w-full max-w-[27.5rem]" {...formik.getFieldProps('password')} placeholder="Password" required />
                            {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xsm mt-2">{formik.errors.password}</p>}
                        </div>

                        <div className="flex">
                            <input type="checkbox" {...formik.getFieldProps('acceptedTerms')} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                            <label className="ml-2 text-gray text-xsm">
                                I've read and accepted{' '}
                                <a href="/terms" className="text-blue font-semibold">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/policy" className="text-blue font-semibold">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>
                        {formik.touched.acceptedTerms && formik.errors.acceptedTerms && <p className="text-red-500 text-xsm mt-2">{formik.errors.acceptedTerms}</p>}

                        <button type="submit" className="w-full max-w-[27.5rem] bg-blue text-white font-semibold p-3 rounded-md hover:bg-blue-700 transition" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <p className="text-left text-gray text-xsm mt-4">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue font-bold hover:underline">
                                Log In
                            </a>
                        </p>

                        {/* <div className="flex items-center my-4 max-w-[27.5rem]">
                            <hr className="flex-grow border-gray" />
                            <span className="px-2 text-secondary text-sm font-semibold">or use</span>
                            <hr className="flex-grow border-gray" />
                        </div> */}

                        {/* <div className="flex flex-col space-y-3 font-inter">
                            <button className="w-full max-w-[27.5rem] bg-white border border-gray-300 text-black font-medium text-ssm p-3 rounded-md hover:bg-gray-300 transition">
                                Sign Up with Gmail
                            </button>
                            <button className="w-full max-w-[27.5rem] bg-white border border-gray-300 text-black font-medium text-ssm p-3 rounded-md hover:bg-gray-300 transition">
                                Sign Up with G Suite
                            </button>
                            <button className="w-full max-w-[27.5rem] bg-white border border-gray-300 text-black font-medium text-ssm p-3 rounded-md hover:bg-gray-300 transition">
                                Sign Up with Zoho Account
                            </button>
                        </div> */}

                    </form>
                </div>
                <div className="block relative ">
                    <LazyImage src="/assets/images/SignInImage.png" alt="Hero Image" className="object-scale-down w-full h-full max-h-[400px] sm:max-h-max" />
                </div>
            </div>
        </div>
    );
}
