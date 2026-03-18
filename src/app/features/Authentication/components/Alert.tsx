import { FC, HTMLProps, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import IconX from '../../../../_theme/components/Icon/IconX';
import { removeAlert } from '../../../slices/usersSlice';

interface AlertProps extends HTMLProps<HTMLButtonElement> {
    title: string;
    message: string;
    variant: 'success' | 'danger' | 'warning' | 'info';
}

const Alert: FC<AlertProps> = ({ title, variant, message, ...props }) => {
    const [clicked, setClicked] = useState<Boolean>(false);
    const dispatch = useDispatch();
    useEffect(() => {
        // move the scroll to the div having having the alert
        if (variant === 'danger' || variant === 'warning') {
            const alert = document.querySelector('.custom_alert');
            if (alert) {
                alert.scrollIntoView({ behavior: 'smooth' });
            }
        }
        window.scrollTo(0, 0);

        setTimeout(() => {
            if (!clicked) setClicked(true);
        }, 5000);
    }, []);

    useEffect(() => {
        if (clicked) {
            dispatch(removeAlert());
        }
    }, [clicked]);

    return (
        <button
            onClick={() => setClicked(true)}
            {...props}
            type="button"
            className={`${!!clicked && 'hidden'}  ${props.className ?? ''} custom_alert animate__fadeOut cursor-default w-full dark:text-white-light  flex items-center p-3.5 rounded text-${variant} ${
                variant != 'warning' ? ` bg-${variant}-light ` : ' bg-warning/20 text-warning'
            }  dark:bg-info-dark-light mb-5`}
        >
            <span className="ltr:pr-2 rtl:pl-2">
                <strong className="ltr:mr-1 rtl:ml-1">{title}</strong> {message}
            </span>
            <span className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                <IconX className="scale-[0.9]" />
            </span>
        </button>
    );
};

export default Alert;
