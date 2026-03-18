import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setPageTitle } from '../../../_theme/themeConfigSlice';
import SignIn from '../../features/Authentication/components/forms/SignIn';
import Footer from '../../shared/components/nav-bar/Footer';
import Header from '../../shared/components/nav-bar/Header';

function Login(): ReturnType<FC> {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Login'));
    }, []);

    return (
        <>
            <Header />
            <SignIn />
            <Footer />
        </>
    );
}

export default Login;
