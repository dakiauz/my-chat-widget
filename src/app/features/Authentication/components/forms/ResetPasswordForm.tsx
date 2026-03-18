import { showNotification } from '@mantine/notifications';
import { useFormik } from 'formik';
import { FC } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import FormFeedback from '../../../../shared/components/forms/FormFeedback';
import FormGroup from '../../../../shared/components/forms/FormGroup';
import FormInput from '../../../../shared/components/forms/FormInput';
import FormLabel from '../../../../shared/components/forms/FormLabel';
import { useResetPasswordMutation } from '../../services/authApi';

const PasswordResetForm: FC = () => {
    const navigate = useNavigate();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const { token } = useParams();
    const email = searchParams.get('email');

    const validation = useFormik({
        validateOnBlur: false,
        enableReinitialize: true,
        initialValues: {
            email: email || '',
            token: token,
            password: '',
            password_confirmation: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required'),
            token: Yup.string().required('Token is required'),
            password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
            password_confirmation: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Confirm Password is required'),
        }),
        onSubmit: async (values) => {
            try {
                await resetPassword(values).unwrap();
                showNotification({
                    title: 'Success',
                    message: 'Password reset successfully!',
                    color: 'green',
                });
                navigate(`/login`);
            } catch (error) {
                showNotification({
                    title: 'Error',
                    message: 'Something went wrong! Please try again later.',
                    color: 'red',
                });
            } finally {
                validation.setSubmitting(false);
            }
        },
    });

    return (
        <form className="!font-inter grid grid-cols-12 gap-4" onSubmit={validation.handleSubmit}>
            <FormGroup className="col-span-12 !mb-0">
                <FormLabel required htmlFor="email">Email</FormLabel>
                <FormInput
                    disabled
                    invalid={Boolean(validation.errors.email)}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.email}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                />
                <FormFeedback error={validation.errors.email} />
            </FormGroup>
            
            <FormGroup className="col-span-12 !mb-0">
                <FormLabel required htmlFor="password">Password</FormLabel>
                <FormInput
                    invalid={Boolean(validation.errors.password)}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.password}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                />
                <FormFeedback error={validation.errors.password} />
            </FormGroup>

            <FormGroup className="col-span-12 !mb-0">
                <FormLabel required htmlFor="password_confirmation">Confirm Password</FormLabel>
                <FormInput
                    invalid={Boolean(validation.errors.password_confirmation)}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.password_confirmation}
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    placeholder="Confirm Password"
                />
                <FormFeedback error={validation.errors.password_confirmation} />
            </FormGroup>

            <button
                disabled={validation.isSubmitting}
                type="submit"
                className="col-span-12 inline-flex !mt-6 w-full btn bg-blue text-white h-10 gap-1 items-center justify-center p-0 transition ring-inset ring-white/50 shadow-none dark:shadow-md dark:hover:!shadow-white lg:hover:ring-1"
            >
                {validation.isSubmitting ? (
                    <>
                        <span className="animate-ping w-3 h-3 ltr:mr-4 rtl:ml-4 inline-block rounded-full  bg-white"></span>
                        <span className="pr-10">Please Wait</span>
                    </>
                ) : (
                    'Reset Password'
                )}
            </button>
        </form>
    );
};

export default PasswordResetForm;
