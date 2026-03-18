import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authApi from '../../../app/features/Authentication/services/authApi';
import ClearEatsSuspenseLoader from '../../../app/shared/components/ui/loaders/ClearEatsSuspenseLoader';
import { logout } from '../../../app/slices/authSlice';

function Logout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        localStorage.removeItem('token');
        dispatch(authApi.util.resetApiState());
        dispatch(logout());
        console.log('Logged out successfully');
        navigate('/login');
    }, []);
    return <ClearEatsSuspenseLoader message="Logging out..." show={true} />;
}

export default Logout;
