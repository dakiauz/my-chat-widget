import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import LazyImage from '../../../../app/shared/components/LazyImage';
import { IRootState } from '../../../../app/store';

function ProfileMenu() {
    const user = useSelector((state: IRootState) => state.auth.user);
    const [isUserMenuOpen, setUserMenuOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleUserMenu = () => setUserMenuOpen(!isUserMenuOpen);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setUserMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navigate = useNavigate();
    const userPermission = user?.roles?.some((role) => role?.permissions?.some((permission) => permission.name === 'View User'));
    const rolePermission = user?.roles?.some((role) => role?.permissions?.some((permission) => permission.name === 'View Role'));
    return (
        <div className="relative ml-3" ref={dropdownRef}>
            <button
                type="button"
                className={`peer relative flex rounded-full bg-gray-800 outline-none text-sm focus:outline-none  ${isUserMenuOpen ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-500 ' : ''}`}
                id="user-menu-button"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                onClick={toggleUserMenu}
            >
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">Open user menu</span>
                <LazyImage src="/assets/images/user-dummy-img.jpg" className="h-8 w-8 rounded-full" alt="" />
            </button>

            <div
                className={`${
                    isUserMenuOpen ? 'translate-y-2 opacity-100 z-10' : '-translate-y-2 opacity-0 z-[-1]'
                } transition-all delay-75 absolute right-0 w-48 origin-top-right rounded-md bg-white pt-1 shadow-lg focus:outline-none`}
                role="menu"
            >
                <div>
                    <div className="px-4 py-3 border-b flex gap-1 flex-col">
                        <p className="text-sm font-semibold text-gray">Profile</p>
                        <p className="text-sm font-semibold truncate">{user?.name} </p>
                        <p className="text-xsm text-gray truncate ">{user?.email} </p>
                    </div>
                    <div className="px-4 py-3 border-b flex gap-1 flex-col">
                        <p className="text-xs font-semibold text-gray">User Management</p>
                        <div>
                            {userPermission && (
                                <button
                                    className=" text-xs p-3 w-full text-start hover:bg-white-light/50"
                                    onClick={() => {
                                        navigate('/users');
                                        setUserMenuOpen(false);
                                    }}
                                >
                                    Users
                                </button>
                            )}
                            {rolePermission && (
                                <button
                                    className=" text-xs p-3 w-full text-start hover:bg-white-light/50"
                                    onClick={() => {
                                        navigate('/roles');
                                        setUserMenuOpen(false);
                                    }}
                                >
                                    Roles
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <Link to="/logout" role="menuitem" tabIndex={-1}>
                    <button className="text-danger px-4 py-3 border-t w-full text-start hover:bg-white-light/50">Log out</button>
                </Link>
            </div>
        </div>
    );
}

export default ProfileMenu;
