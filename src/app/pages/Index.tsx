import { Suspense, lazy, useEffect, useState } from 'react';
import SuspenseTrigger from '../../_theme/components/SuspenseTrigger';
import useNavigateWithFrom from '../shared/hooks/useNavigateWithFrom';
import { Link } from 'react-router-dom';
import Welcome from '../shared/components/ui/pages/Welcome';

const Component = () => {
    const navigate = useNavigateWithFrom();
    return <Welcome />;
};

const Index = () => (
    <>
        <Component />
    </>
);

export default Index;
