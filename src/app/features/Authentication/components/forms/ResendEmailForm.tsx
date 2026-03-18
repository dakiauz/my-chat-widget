import { showNotification } from '@mantine/notifications';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import IconCheck from '../../../../../_theme/components/Icon/IconCheck';
import { loginFailed } from '../../../../slices/authSlice';
import { addAlert } from '../../../../slices/systemAlertSlice';
import { useResendVerificationEmailMutation } from '../../services/authApi';

const ResendEmailForm: FC = () => {
    const [resendEmailVerification, { isLoading }] = useResendVerificationEmailMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleResendEmail = async () => {
        try {
            const result = await resendEmailVerification().unwrap(); // Do not pass token here
    
            if (result.success) {
                showNotification({
                    title: 'Success!',
                    message: result.message,
                    color: 'teal',
                    icon: <IconCheck />,
                });
                navigate('/dashboard');
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error("Error resending email:", error);
    
            dispatch(loginFailed('Session expired. Please login again.'));
            dispatch(
                addAlert({
                    variant: 'warning',
                    message: 'Please login again.',
                    title: 'Session Expired!',
                })
            );
    
            navigate('/logout');
        }
    };
    

    return (
        <div className=" flex items-center justify-center">
            <div className="font-inter"> 
                <p className="text-gray-600 text-xs mb-4">Your account has been successfully registered. Please check your inbox for the verification link.</p>
                <button className="bg-blue text-white font-semibold py-2 px-4 rounded-md w-full h-12 text-lg border mt-2 hover:bg-blue-600 transition-all" onClick={handleResendEmail} disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Resend Link'}
                </button>
            </div>
        </div>
    );
    
};

export default ResendEmailForm;
