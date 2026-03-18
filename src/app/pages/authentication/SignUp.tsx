import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setPageTitle } from '../../../_theme/themeConfigSlice';
import SignUp from '../../features/Authentication/components/forms/SignUp';
import Footer from '../../shared/components/nav-bar/Footer';
import Header from '../../shared/components/nav-bar/Header';

function Login(): ReturnType<FC> {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('SignUp'));
    }, []);

    return (
        <><Header />
        <SignUp />
        <Footer/>
        </>

    );

   
}

export default Login;
