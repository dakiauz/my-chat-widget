import { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { useGetUserMutation } from '../../features/Authentication/services/authApi';
import ClearEatsSplashLoader from '../../shared/components/ui/loaders/ClearEatsSplashLoader';
import Show from '../../shared/helpers/Show';
import useNavigateWithFrom from '../../shared/hooks/useNavigateWithFrom';
import { loginFailed, loginSuccess, rememberLogin } from '../../slices/authSlice';
import { addAlert } from '../../slices/systemAlertSlice';
import { IRootState } from '../../store';

function PersistantUser() {
    const auth = useSelector((state: IRootState) => state.auth);
    const dispatch = useDispatch();
    const [getUser, { data, error, isLoading }] = useGetUserMutation();
    const navigate = useNavigateWithFrom();
    const location = useLocation();

    // Track last visited page, excluding login/logout
    const [lastVisitedPage, setLastVisitedPage] = useState<string>('/dashboard');

    // Prevent rendering while checking auth state
    const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

    useLayoutEffect(() => {
        if (localStorage.getItem('authToken') && !auth.token) {
            dispatch(rememberLogin({ token: localStorage.getItem('authToken') }));
        }
    }, []);

    useEffect(() => {
        // Prevent page from flashing before redirect
        setCheckingAuth(true);

        // Update last visited page unless it's login or logout
        if (!['/login', '/logout'].includes(location.pathname)) {
            setLastVisitedPage(location.pathname);
        }

        if (auth.token && !auth.user && auth.loading) {
            // console.log('Fetching user data...');

            getUser(auth.token)
                .unwrap()
                .then((res) => {
                    if (res.success) {
                        let userData = {
                            user: { ...res.data },
                            token: auth.token,
                        };
                        dispatch(loginSuccess(userData));

                        // console.log('User authenticated successfully. Checking navigation...');

                        // Redirect the user immediately before rendering the wrong page
                        if (['/login', '/sign-up', 'forgot-password', 'email-verify'].includes(location.pathname)) {
                            // console.log(`Preventing access to ${location.pathname}, redirecting to: ${lastVisitedPage}`);
                            navigate(lastVisitedPage);
                        } else {
                            navigate(location.pathname !== '/' ? location.pathname + location.search : '/dashboard');
                        }
                    } else {
                        console.log('User fetch failed:', res.message);

                        localStorage.removeItem('authToken');
                        // console.log('Authentication failed. Redirecting to /logout');
                        navigate('/logout');
                        dispatch(loginFailed('Please login again.'));
                        dispatch(
                            addAlert({
                                variant: 'warning',
                                message: 'Please login again.',
                                title: 'Session Expired!',
                            })
                        );
                    }
                })
                .catch((err: any) => {
                    console.error('Error fetching user:', err);

                    if (err.status === 401 && auth.token) {
                        // console.log('Handling 401 error...');
                        switch (err.data?.error) {
                            case 'Please verify your email to continue.':
                                // console.log('User email not verified. Redirecting to dashboard.');
                                dispatch(
                                    loginSuccess({
                                        user: {
                                            id: -1,
                                            name: '',
                                            email: '',
                                            email_verified_at: null,
                                            message: '',
                                            created_at: null,
                                            updated_at: null,
                                        },
                                        token: auth.token,
                                    })
                                );
                                return navigate('/dashboard');

                            default: {
                                console.log('Session expired. Redirecting to /');
                                dispatch(
                                    addAlert({
                                        variant: 'warning',
                                        message: 'Please login again.',
                                        title: 'Session Expired!',
                                    })
                                );
                                dispatch(loginFailed(err.data?.error ?? 'Please login again.'));
                                return navigate('/');
                            }
                        }
                    }
                })
                .finally(() => {
                    setCheckingAuth(false);
                });
        } else {
            setCheckingAuth(false);
        }
    }, [auth.token, auth.loading, location.pathname]);

    // **Block rendering if auth check is ongoing**
    if (checkingAuth) {
        return <ClearEatsSplashLoader show={true} />;
    }

    return (
        <>
            <Show when={auth.loading} show={<ClearEatsSplashLoader show={auth.loading} />} or={<Outlet />} />
        </>
    );
}

export default PersistantUser;
