import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setPageTitle } from '../../../_theme/themeConfigSlice';
import Layout from '../../features/Layout';

function Dashboard(): ReturnType<FC> {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Dashboard'));
    }, []);

    return (
        <>
      <Layout/>
        </>

    );

   
}

export default Dashboard;
