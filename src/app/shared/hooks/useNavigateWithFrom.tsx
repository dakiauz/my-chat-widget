import { useLocation, useNavigate } from 'react-router-dom';

const useNavigateWithFrom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromLocation = location.state?.from || null;

    const customHookFunction = (path: string | null) => {
        if (!path) {
            fromLocation ? navigate(fromLocation, { replace: true }) : window.history.back();
            return;
        }

        if (fromLocation && fromLocation !== location.pathname) {
            navigate(fromLocation, { state: { from: `${location.pathname}${location.search}` }, replace: true });
        } else {
            navigate(path, { replace: true });
        }
    };

    return customHookFunction;
};

export default useNavigateWithFrom;
