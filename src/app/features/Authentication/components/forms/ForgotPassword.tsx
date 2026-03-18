import { showNotification } from '@mantine/notifications'; // Import Mantine notification
import { useState } from 'react';
import FormInput from '../../../../shared/components/forms/FormInput';
import FormLabel from '../../../../shared/components/forms/FormLabel';
import { useGetResetLinkMutation } from '../../services/authApi';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [getResetLink, { isLoading }] = useGetResetLinkMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            showNotification({
                title: 'Error',
                message: 'Email is required!',
                color: 'red',
            });
            return;
        }

        try {
            const response = await getResetLink({ email }).unwrap();

            showNotification({
                title: 'Success',
                message: 'Reset link sent successfully!',
                color: 'green',
            });
        } catch (error) {
            console.error('Failed to send reset link:', error);

            showNotification({
                title: 'Error',
                message: 'Failed to send reset link. Please try again!',
                color: 'red',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/assets/images/LoginBg.png')] bg-cover bg-center bg-no-repeat p-4">
            {/* Forgot Password Form */}
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
                <h2 className="text-xl text-black-light font-bold font-montserrat mb-2">Forgot Password</h2>
                <p className="text-gray-600 text-xsm mb-4">Enter your email to reset your password.</p>

                <form onSubmit={handleSubmit} className="space-y-4 font-inter text-left">
                    {/* Email Input */}
                    <div>
                        <FormLabel htmlFor="email" className=" text-black text-xsm font-semibold mb-2">
                            Email
                        </FormLabel>
                        <FormInput
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full p-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Reset Password Button */}
                    <button type="submit" className="w-full bg-blue text-white font-semibold p-3 rounded-md hover:bg-blue-700 transition shadow-lg" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Get Reset Link'}
                    </button>

                    {/* Back to Sign In Link */}
                    <p className="text-gray-600 text-sm mt-4 text-center">
                        Remember your password?{' '}
                        <a href="/login" className="text-blue font-bold hover:underline">
                            Sign in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
