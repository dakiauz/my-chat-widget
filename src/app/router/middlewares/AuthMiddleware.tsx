import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../../pages/authentication/Login';
import { IRootState } from '../../store';

function AuthMiddleware() {
    const location = window.location.pathname;
    const auth = useSelector((state: IRootState) => state.auth);
    return <>{auth.user ? <Outlet /> : <>{auth.token ? <LoginPage /> : <Navigate to="/" state={{ from: location }} replace />}</>}</>;
}

export default AuthMiddleware;
