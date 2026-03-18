import version from '../../../app/shared/utils/version';

const Footer = () => {
    return (
        <div className="dark:text-white-dark text-center ltr:sm:text-left rtl:sm:text-right p-6 pt-0 mt-auto flex justify-end items-center px-8 md:px-16">
            {/* <span>
                © {new Date().getFullYear()}. Clear Eats v<small>{version}</small> All rights reserved.
            </span> */}
            <span>
                Powered by{' '}
                <a href="https://nerdflow.tech" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                    Nerd Flow
                </a>{' '}
                v<small>{version}</small>
            </span>
        </div>
    );
};

export default Footer;
