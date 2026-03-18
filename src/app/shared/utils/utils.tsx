import Swal from 'sweetalert2';

export function bytesToMB(bytes: number) {
    const MB = bytes / (1024 * 1024);
    return MB;
}

export function timeAgo(dateString: string): string {
    const now = new Date();
    const pastDate = new Date(dateString);
    const differenceInMilliseconds = now.getTime() - pastDate.getTime();

    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
    const differenceInHours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    const differenceInYears = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24 * 365));

    if (differenceInMinutes < 60) {
        return `${differenceInMinutes} minutes ago`;
    } else if (differenceInHours < 24) {
        return `${differenceInHours} hours ago`;
    } else if (differenceInDays < 365) {
        return `${differenceInDays} days ago`;
    } else {
        return `${differenceInYears} years ago`;
    }
}

export const colors = ['teal', 'cyan', 'indigo', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow', 'green', 'lime', 'violet'];

export const formatDate = (dateString: string): string => {
    // Append 'T00:00:00' to the date string if it doesn't contain a time part
    const normalizedDateString = dateString.includes(' ') ? dateString : `${dateString}T00:00:00`;
    const date = new Date(normalizedDateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
};

export const isDateFormat = (dateString: string): boolean => {
    const regex1 = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/; // yyyy-mm-dd hh:mm:ss
    const regex2 = /^\d{4}-\d{2}-\d{2}$/; // yyyy-mm-dd
    return regex1.test((dateString + '').trim()) || regex2.test((dateString + '').trim());
};

export type Record = {
    [key: string]: any;
};

export const parseFormattedDate = (formattedDate: string): string => {
    const [day, month, year] = formattedDate.split(' ');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
    const paddedMonth = monthIndex.toString().padStart(2, '0');
    const paddedDay = day.replace(/[^0-9]/g, '').padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
};

export const formatCurrency = (val: string) => {
    if (!val) return val;
    // Remove all non-numeric characters except commas and periods
    val = val.replace(/[^0-9.]/g, '');

    // Split the number on the decimal point
    const parts = val.split('.');

    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Join the parts back together
    return parts.join('.');
};

export const removeFormateCurrency = (val: string) => {
    // Remove all non-numeric characters except periods
    val = val.replace(/[^0-9]/g, '');
    return val ? (val.length < 12 ? parseInt(val) : parseInt(val.slice(0, 12))) : '';
};

export const showMessage = (msg = '', type = 'success') => {
    const toast: any = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        customClass: { container: 'toast' },
    });
    toast.fire({
        icon: type,
        title: msg,
        padding: '10px 20px',
    });
};

export interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    image: string;
    label: string;
    description: string;
    icon?: React.ReactNode;
    color?: string;
}
// { count: 5 }, { refetchOnMountOrArgChange: true }

export function isJsonString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('');
};

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { IAuthState } from '../../features/Authentication/models/auth';

export const formatPhoneNumber = (rawNumber: string) => {
    if (/[a-zA-Z]/.test(rawNumber)) {
        return { display: rawNumber, countryCode: '' };
    }

    const phone = parsePhoneNumberFromString(rawNumber);
    if (!phone) return { display: rawNumber, countryCode: '' };

    const national = phone.formatNational(); // (415) 877-7728
    const countryCode = phone.country; // e.g., 'US', 'PK'

    return { display: national, countryCode };
};

export const hasRole = <T,>(permission: string | string[], menu: T, auth: IAuthState): T | null => {
    if (!permission) return menu;
    return auth.user?.roles && auth.user?.roles[0]?.permissions?.some((role: any) => permission.includes(role.name)) ? menu : null;
};
