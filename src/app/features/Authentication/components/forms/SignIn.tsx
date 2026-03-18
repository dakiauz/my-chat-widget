import { showNotification } from '@mantine/notifications';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import FormInput from '../../../../shared/components/forms/FormInput';
import FormLabel from '../../../../shared/components/forms/FormLabel';
import LazyImage from '../../../../shared/components/LazyImage';
import { loginSuccess } from '../../../../slices/authSlice';
import { IRootState } from '../../../../store';
import { useLoginMutation } from '../../services/authApi';

export default function SignIn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [login, { isLoading, error }] = useLoginMutation();
    const token = useSelector((state: IRootState) => state.auth.token);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
        }),
        onSubmit: async (values) => {
            try {
                const response = await login(values).unwrap();

                dispatch(
                    loginSuccess({
                        user: response.data.user,
                        token: response.data.token,
                        permissions: response.data.permissions, // Ensure this field is returned by API
                    })
                );

                localStorage.setItem('authToken', response.data.token ?? '');

                showNotification({
                    title: 'Success!',
                    message: response.message ?? 'User logged in successfully',
                    color: 'teal',
                });

                navigate('/dashboard');
            } catch (err) {
                console.error('Login Failed:', err);

                showNotification({
                    title: 'Error',
                    message: 'Login failed. Please try again!',
                    color: 'red',
                });
            }
        },
    });

    return (
        <div className=" sm:max-h-[2080px]   flex justify-center items-center pt-[50px] flex-grow container">
            <div className="grid sm:grid-cols-2 mt-[20px]">
                <div className="flex flex-col flex-1 pl-16 py-12  justify-center">
                    <h2 className="text-xl text-black-light font-bold font-montserrat mb-6">Sign In to Dakia.ai</h2>
                    <form className="space-y-4 font-inter" onSubmit={formik.handleSubmit}>
                        <div>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <FormInput variant="filled" id="email" type="email" {...formik.getFieldProps('email')} placeholder="Email" className="w-full max-w-[27.5rem]  " />
                            {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xsm mt-2">{formik.errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center max-w-[27.5rem]">
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <a href="/forgot-password" className="text-blue font-bold text-xsm  hover:underline">
                                    Forgot Password?
                                </a>
                            </div>
                            <FormInput variant="filled" id="password" type="password" {...formik.getFieldProps('password')} placeholder="Password" className="w-full max-w-[27.5rem]" />
                            {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xsm mt-2">{formik.errors.password}</p>}
                        </div>

                        {error && <p className="text-red-500 text-xsm mt-2">Invalid email or password. Please try again.</p>}
                        <div className="!mt-10">
                            <button
                                type="submit"
                                className="w-full max-w-[27.5rem] bg-blue text-white font-semibold p-3 rounded-md hover:bg-blue-700 transition shadow-[0px_16px_40px_-6px_rgba(0,0,0,0.3)]"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                        <p className="text-left text-gray text-xsm mt-4">
                            Don't have an account?{' '}
                            <a href="/sign-up" className="text-blue font-bold hover:underline">
                                Create account
                            </a>
                        </p>
                        {/* Divider
                        <div className=" flex items-center my-4 max-w-[27.5rem]">
                            <hr className="flex-grow border-gray" />
                            <span className="px-2 text-secondary text-sm font-semibold">or use</span>
                            <hr className="flex-grow border-gray" />
                        </div> */}

                        {/* Sign Up Options */}
                        {/* <div className=" flex flex-col space-y-3 font-inter">
                            <button className="w-full max-w-[27.5rem] bg-white border border-gray-300 text-black font-medium text-ssm p-3 rounded-md hover:bg-gray-300 transition">
                                Sign Up with Gmail
                            </button>
                            <button className="w-full max-w-[27.5rem] bg-white border border-gray-300 text-black font-medium text-ssm p-3 rounded-md hover:bg-gray-300 transition">
                                Sign Up with G Suite
                            </button>
                            <button className="w-full max-w-[27.5rem] bg-white border border-gray-300 text-black font-medium text-ssm p-3 rounded-md hover:bg-gray-300 transition">
                                Sign Up with Zoho Account
                            </button>
                            <button className="w-full max-w-[27.5rem] bg-white border border-gray-300 text-black font-medium text-ssm p-3 rounded-md hover:bg-gray-300 transition">
                                Sign Up with Outlook
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
