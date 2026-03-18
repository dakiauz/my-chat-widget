import { getContactName, getContactNameWithoutFormatting } from '../components/contacts/ContactList';
import { IContact } from '../models/calls';

export const groupContactsByLetter = (contacts: IContact[]) => {
    return contacts?.reduce((acc, contact) => {
        const firstLetter = getContactNameWithoutFormatting(contact).charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(contact);
        return acc;
    }, {} as Record<string, IContact[]>);
};

export const filterContacts = (contacts: IContact[], query: string) => {
    return contacts
        ?.filter((contact) => getContactNameWithoutFormatting(contact).toLowerCase().includes(query.toLowerCase()))
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
};

export const formatCallTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
