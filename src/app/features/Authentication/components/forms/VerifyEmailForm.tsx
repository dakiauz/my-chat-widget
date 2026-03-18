import { FC, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useVerifyEmailQuery } from '../../services/authApi';

const VerifyEmailForm: FC = () => {
    const { id, hash } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const navigate = useNavigate();

    // Ensure all parameters are present before making the request
    if (!id || !hash) {
        return <div className=" text-center text-black">Invalid verification link.</div>;
    }

    const { data, error, isLoading } = useVerifyEmailQuery({
        id,
        hash,
    });

    // Handle navigation after verification success
    useEffect(() => {
        if (data?.success) {
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        }
    }, [data, navigate]);

    if (isLoading) return <div className="text-black text-center">Please wait while we verify your email...</div>;

    if (error) {
        return <div className="text-red-700 text-center">Error: {(error as any)?.data?.error ?? 'Something went wrong.'}</div>;
    }

    return <div className="text-blue text-center">{data?.success ? <p>Email verified successfully!</p> : <p>{data?.message ?? 'Verification failed.'}</p>}</div>;
};

export default VerifyEmailForm;
