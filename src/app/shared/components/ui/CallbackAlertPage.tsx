import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';

function OutlookVerification() {
    const dispatch = useDispatch();
    const [status, setStatus] = useState<{ success: boolean; message: string }>({
        success: false,
        message: '',
    });
    console.log('OutlookVerification component rendered');

    useEffect(() => {
        dispatch(setPageTitle('Outlook Verification'));
        console.log('Setting page title to Outlook Verification');
        const params = new URLSearchParams(window.location.search);
        const platform = params.get('platform');
        const successParam = params.get('success');
        const messageParam = params.get('message');

        if (platform === 'outlook' && localStorage.getItem('connect') === 'outlook') {
            setStatus({
                success: successParam === 'true',
                message: messageParam || '',
            });

            const timeoutRemove = setTimeout(() => {
                localStorage.removeItem('connect');
            }, 5000);

            return () => clearTimeout(timeoutRemove);
        }
    }, [dispatch]);

    useEffect(() => {
        console.log('Redirect effect running...');
        const timer = setTimeout(() => {
            console.log('Redirecting...');
            window.location.href = '/integrations';
        }, 5000);

        return () => {
            console.log('Component unmounted, timer cleared');
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/assets/images/LoginBg.png')] bg-cover bg-center bg-no-repeat">
            <div className="w-full max-w-md bg-white px-8 py-10 rounded-2xl shadow-lg text-center">
                <div className="pb-6">
                    <h1 className={`text-xl font-bold font-montserrat ${status.success ? 'text-green-600' : 'text-red-600'}`}>{status.success ? 'Success!' : 'Error'}</h1>
                    <p className="text-xsm mt-2 text-gray-600 break-words">{status.message}</p>
                </div>
            </div>
        </div>
    );
}

export default OutlookVerification;
