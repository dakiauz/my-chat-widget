import { useGetResetLinkMutation } from '../../services/authApi';

export const requestResetLink = async (email: string) => {
    const [getResetLink] = useGetResetLinkMutation();

    try {
        const response = await getResetLink({ email }).unwrap();
    } catch (error) {
        console.error('Error sending reset link:', error);
    }
};
