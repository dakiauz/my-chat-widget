import { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';

const AuthenticationCard: FC<{ children: ReactNode; title: string; description: string; size?: 'md' | 'lg' }> = ({ children, title, description, size }) => {
    const usersSlice = useSelector((state: IRootState) => state.users) as IRootState['users'];

    // Set width dynamically
    const switchSize = useMemo(() => {
        switch (size) {
            case 'md':
                return 'max-w-md'; // Equivalent to max-width: 28rem (448px)
            case 'lg':
                return 'max-w-lg'; // Equivalent to max-width: 32rem (512px)
            default:
                return 'max-w-md'; // Default should be medium
        }
    }, [size]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className={`w-full ${switchSize} bg-white px-8 py-10 rounded-2xl shadow-lg text-center`}>
                <div className="pb-6">
                    <h1 className="text-xl text-black-light font-bold font-montserrat ">{title}</h1>
                    <p className="text-xsm mt-2 text-gray-600">{description}</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthenticationCard;
