import { useDispatch } from 'react-redux';
import IconCaretsDown from '../../Icon/IconCaretsDown';
import { toggleSidebar } from '../../../themeConfigSlice';
import { Link } from 'react-router-dom';
import IconMenu from '../../Icon/IconMenu';

const SidebarToggler = () => {
    const dispatch = useDispatch();
    return (
        <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
            <Link to="" className="main-logo flex items-center shrink-0">
                <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">
                    <img className="object-scale-down w-36  flex-none" src="/assets/images/Dakia logo.png" alt="logo" />
                </span>
            </Link>
            <button
                type="button"
                className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                onClick={() => {
                    dispatch(toggleSidebar());
                }}
            >
                <IconMenu className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SidebarToggler;
