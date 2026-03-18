import { Link } from 'react-router-dom';
import LazyImage from '../../../../shared/components/LazyImage';

function SplashCompanyLogo() {
    return (
        <>
            <Link to="/" className="w-full  block">
                <LazyImage src="/assets/brand-logos/favicon-light.png" alt="Logo" className="mx-auto object-scale-down w-40 mt-5" />
            </Link>
            <div className="mb-[1rem]">
                <p className="text-base  leading-normal text-white text-center">Dakia.ai</p>
            </div>
        </>
    );
}

export default SplashCompanyLogo;
