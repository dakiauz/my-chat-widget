import { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LazyImage from '../LazyImage';

const dakiaWebsiteUrl = window.location.origin;

const NAV_LINKS = [
    { label: 'Home', href: dakiaWebsiteUrl },
    { label: 'Customer Stories', href: `${dakiaWebsiteUrl}/customer-stories` },
    { label: 'Pricing', href: `${dakiaWebsiteUrl}/pricing` },
    { label: 'Login', href: `/login` },
];

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activePath, setActivePath] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    useEffect(() => {
        // Disable scroll when the menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    }, [isMenuOpen]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setActivePath(window.location.pathname);

            const handleScroll = () => {
                setIsScrolled(window.scrollY > 50);
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const isActive = (path: string) => activePath === path;

    const getStartedLink = '/sign-up';

    return (
        <header className={`${'fixed top-0 left-0 w-full z-[100] py-4 font-inter transition-colors duration-300'} ${isScrolled ? 'bg-[rgba(255,255,255,0.1)] backdrop-blur-xl' : ' bg-transparent'}`}>
            <div className="container relative">
                <div className="flex items-center justify-between py-2">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/">
                            <LazyImage src="/assets/images/Dakia logo.png" alt="Logo" className="w-[10rem] sm:w-[12rem] md:w-[13rem] max-h-[3rem] object-contain" />
                        </Link>
                    </div>

                    {/* Burger Menu Icon for Medium and Small Screens */}
                    <div className="flex md:hidden items-center">
                        <button onClick={toggleMenu} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className="text-2xl text-primary focus:outline-none">
                            {Boolean(isMenuOpen) ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>

                    {/* Navigation Links for Large Screens */}
                    <nav className={`  hidden lg:flex justify-end flex-1 text-[0.875rem] font-semibold`}>
                        <ul className="flex space-x-8 sm:space-x-12 md:space-x-2 lg:space-x-8 relative">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href} className="relative">
                                    <Link
                                        to={link.href}
                                        className={`
                      ${isActive(link.href) ? 'text-primary' : 'text-black/60'}
                      hover:text-primary transition-colors duration-300 font-semibold`}
                                    >
                                        <span
                                            className={`
                        ${isScrolled ? 'bg-primary' : 'bg-primary'}
                        absolute -bottom-2 left-0 right-0 h-[3px]  transition-all w-0 ${isActive(link.href) ? 'w-[50%]' : ''}`}
                                        ></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="relative">
                                <Link to={getStartedLink} className={`  ${isScrolled ? 'bg-white text-primary' : 'bg-primary text-white'} rounded-lg py-[0.75rem] px-[0.875rem] `}>
                                    Get Started
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden top-[6rem] w-full fixed  right-0 bg-teal bg-primary bg-opacity-90 text-white transform   duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0 opacity-100  transition-opacity' : 'translate-x-full opacity-0 transition-transform'
                        }`}
                >
                    <nav className="flex flex-col justify-center items-center py-16 h-[calc(100vh-90px)] overflow-y-auto" onClick={closeMenu}>
                        {NAV_LINKS.map((link) => (
                            <Link key={link.href} to={link.href} className="text-xl font-semibold hover:bg-white/80 hover:text-primary w-full text-center p-2 py-3">
                                {link.label}
                            </Link>
                        ))}
                        <Link to={getStartedLink} className="text-xl font-semibold hover:bg-white/80 hover:text-primary w-full text-center p-2 py-3 pb-[50px]">
                            Get Started
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
