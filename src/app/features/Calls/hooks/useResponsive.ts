import { useEffect } from 'react';
import { setMobile } from '../../../slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useResponsive = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768;
            dispatch(setMobile(isMobile));
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [dispatch]);
};
