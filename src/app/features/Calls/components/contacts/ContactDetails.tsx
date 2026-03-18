import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { IconMessage, IconEdit, IconPhone } from '@tabler/icons-react';
import { MobileHeader } from '../layout/mobile-header';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { IAppDispatch, IRootState } from '../../../../store';
import { setDialerOpen, setNumber, startCall } from '../../../../slices/dialerSlice';
import { IContact } from '../../models/calls';
import { CallLogsSection } from '../call-logs/CallLogsSection';
import { getContactName, getContactNameWithoutFormatting, getContactPhoneNumber } from './ContactList';
import { getInitials } from '../../../../shared/utils/utils';
import { useNavigate } from 'react-router-dom';
import { useCreateConversationMutation } from '../../../Conversations/services/conversationsApiSlice';
import { showNotification } from '@mantine/notifications';

interface ContactDetailsProps {
    contact: IContact[];
    fetching: boolean;
}

const ContactDetails = React.memo(({ contact, fetching }: ContactDetailsProps) => {
    const dispatch = useDispatch<IAppDispatch>();
    const { logs } = useSelector((state: IRootState) => state.callLogs);
    const { isMobile } = useSelector((state: IRootState) => state.ui);

    // Safety check: If contact array is empty or undefined, show a message
    if (!contact || contact.length === 0) {
        return (
            <motion.div className="flex flex-grow flex-col items-center justify-center p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">No Contact Selected</p>
                    <p className="text-gray-400 text-sm">Select a contact from the list to view details</p>
                </div>
            </motion.div>
        );
    }

    const contactCallLogs = React.useMemo(
        () =>
            logs.map((log) => {
                return {
                    ...log,
                    contactName: getContactName(contact[0]),
                    phone: getContactPhoneNumber(contact[0]) || '',
                    contactInitials: getInitials(getContactNameWithoutFormatting(contact[0])),
                };
            }),
        [logs, contact]
    );

    const handleStartCall = React.useCallback(() => {
        dispatch(setNumber(getContactPhoneNumber(contact[0]) || ''));
        dispatch(setDialerOpen(true));
        // dispatch(startCall({ contact: contact[0] }));
        // dispatch(setDialerOpen(true));
    }, [dispatch, contact]);

    const handleCallBack = React.useCallback(
        (phone: string) => {
            const callContact = { ...contact[0], phone };
            // dispatch(startCall({ contact: callContact }));
            // dispatch(setDialerOpen(true));
            dispatch(setNumber(getContactPhoneNumber(callContact) || ''));
            dispatch(setDialerOpen(true));
        },
        [dispatch, contact]
    );

    const [createConversation, { isLoading: isCreating }] = useCreateConversationMutation();

    const navigate = useNavigate();

    return (
        <motion.div className="flex flex-grow flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Mobile Header */}
            <MobileHeader />

            {/* Contact Details Content */}
            <div className={`flex flex-grow flex-col overflow-hidden`}>
                <div className={`p-${isMobile ? '4' : '6'} border-b `}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M13.5794 0.515625H1.42285C0.939602 0.515625 0.547852 0.907376 0.547852 1.39062V9.60962C0.547852 10.0929 0.939602 10.4846 1.42285 10.4846H13.5794C14.0626 10.4846 14.4544 10.0929 14.4544 9.60962V1.39062C14.4544 0.907376 14.0626 0.515625 13.5794 0.515625Z"
                                        fill="url(#paint0_linear_1570_18850)"
                                    />
                                    <path
                                        d="M13.5794 0.515625H1.42285C0.939602 0.515625 0.547852 0.907376 0.547852 1.39062V9.60962C0.547852 10.0929 0.939602 10.4846 1.42285 10.4846H13.5794C14.0626 10.4846 14.4544 10.0929 14.4544 9.60962V1.39062C14.4544 0.907376 14.0626 0.515625 13.5794 0.515625Z"
                                        fill="url(#paint1_linear_1570_18850)"
                                    />
                                    <path
                                        d="M7.50085 0.515625V10.4841H1.42285C1.19079 10.4841 0.968227 10.3919 0.804133 10.2278C0.640039 10.0637 0.547852 9.84119 0.547852 9.60913V1.39062C0.547852 0.907125 0.939352 0.515625 1.42285 0.515625H7.50085Z"
                                        fill="url(#paint2_linear_1570_18850)"
                                    />
                                    <path
                                        d="M7.50085 0.515625V10.4841H1.42285C1.19079 10.4841 0.968227 10.3919 0.804133 10.2278C0.640039 10.0637 0.547852 9.84119 0.547852 9.60913V1.39062C0.547852 0.907125 0.939352 0.515625 1.42285 0.515625H7.50085Z"
                                        fill="url(#paint3_radial_1570_18850)"
                                    />
                                    <path
                                        d="M7.5 0.515625V10.4841H13.578C13.8101 10.4841 14.0326 10.3919 14.1967 10.2278C14.3608 10.0637 14.453 9.84119 14.453 9.60913V1.39062C14.453 1.15856 14.3608 0.936001 14.1967 0.771907C14.0326 0.607813 13.8101 0.515625 13.578 0.515625H7.5Z"
                                        fill="url(#paint4_linear_1570_18850)"
                                    />
                                    <path
                                        d="M7.5 0.515625V10.4841H13.578C13.8101 10.4841 14.0326 10.3919 14.1967 10.2278C14.3608 10.0637 14.453 9.84119 14.453 9.60913V1.39062C14.453 1.15856 14.3608 0.936001 14.1967 0.771907C14.0326 0.607813 13.8101 0.515625 13.578 0.515625H7.5Z"
                                        fill="url(#paint5_linear_1570_18850)"
                                    />
                                    <path
                                        d="M7.5 0.515625V10.4841H13.578C13.8101 10.4841 14.0326 10.3919 14.1967 10.2278C14.3608 10.0637 14.453 9.84119 14.453 9.60913V1.39062C14.453 1.15856 14.3608 0.936001 14.1967 0.771907C14.0326 0.607813 13.8101 0.515625 13.578 0.515625H7.5Z"
                                        fill="url(#paint6_linear_1570_18850)"
                                    />
                                    <path
                                        d="M7.5 0.515625V10.4841H13.578C13.8101 10.4841 14.0326 10.3919 14.1967 10.2278C14.3608 10.0637 14.453 9.84119 14.453 9.60913V1.39062C14.453 1.15856 14.3608 0.936001 14.1967 0.771907C14.0326 0.607813 13.8101 0.515625 13.578 0.515625H7.5Z"
                                        fill="url(#paint7_linear_1570_18850)"
                                    />
                                    <g filter="url(#filter0_i_1570_18850)">
                                        <path
                                            d="M0.547375 9.60874C0.547373 9.54421 0.563805 9.48074 0.595122 9.42432C0.62644 9.3679 0.67161 9.32038 0.726375 9.28624L7.39038 5.12024C7.42216 5.10038 7.45889 5.08984 7.49638 5.08984C7.53386 5.08984 7.57059 5.10038 7.60238 5.12024L14.2889 9.31124C14.3914 9.37574 14.4539 9.48774 14.4539 9.60874C14.4539 9.84081 14.3617 10.0634 14.1976 10.2275C14.0335 10.3916 13.8109 10.4837 13.5789 10.4837H1.42188C1.18981 10.4837 0.967251 10.3916 0.803157 10.2275C0.639062 10.0634 0.546875 9.84081 0.546875 9.60874"
                                            fill="url(#paint8_linear_1570_18850)"
                                        />
                                    </g>
                                    <path
                                        d="M0.547375 9.60874C0.547373 9.54421 0.563805 9.48074 0.595122 9.42432C0.62644 9.3679 0.67161 9.32038 0.726375 9.28624L7.39038 5.12024C7.42216 5.10038 7.45889 5.08984 7.49638 5.08984C7.53386 5.08984 7.57059 5.10038 7.60238 5.12024L14.2889 9.31124C14.3914 9.37574 14.4539 9.48774 14.4539 9.60874C14.4539 9.84081 14.3617 10.0634 14.1976 10.2275C14.0335 10.3916 13.8109 10.4837 13.5789 10.4837H1.42188C1.18981 10.4837 0.967251 10.3916 0.803157 10.2275C0.639062 10.0634 0.546875 9.84081 0.546875 9.60874"
                                        fill="url(#paint9_linear_1570_18850)"
                                    />
                                    <path
                                        d="M0.547375 9.60874C0.547373 9.54421 0.563805 9.48074 0.595122 9.42432C0.62644 9.3679 0.67161 9.32038 0.726375 9.28624L7.39038 5.12024C7.42216 5.10038 7.45889 5.08984 7.49638 5.08984C7.53386 5.08984 7.57059 5.10038 7.60238 5.12024L14.2889 9.31124C14.3914 9.37574 14.4539 9.48774 14.4539 9.60874C14.4539 9.84081 14.3617 10.0634 14.1976 10.2275C14.0335 10.3916 13.8109 10.4837 13.5789 10.4837H1.42188C1.18981 10.4837 0.967251 10.3916 0.803157 10.2275C0.639062 10.0634 0.546875 9.84081 0.546875 9.60874"
                                        fill="url(#paint10_linear_1570_18850)"
                                    />
                                    <g filter="url(#filter1_ii_1570_18850)">
                                        <path
                                            d="M0.547375 1.39062C0.547373 1.45516 0.563805 1.51863 0.595122 1.57505C0.62644 1.63147 0.67161 1.67899 0.726375 1.71313L7.39038 5.87862C7.42216 5.89849 7.45889 5.90903 7.49638 5.90903C7.53386 5.90903 7.57059 5.89849 7.60238 5.87862L14.2889 1.68762C14.3393 1.65621 14.381 1.61245 14.4098 1.56049C14.4387 1.50853 14.4539 1.45007 14.4539 1.39062C14.4539 1.15856 14.3617 0.936001 14.1976 0.771907C14.0335 0.607813 13.8109 0.515625 13.5789 0.515625H1.42188C1.18981 0.515625 0.967251 0.607813 0.803157 0.771907C0.639062 0.936001 0.546875 1.15856 0.546875 1.39062"
                                            fill="url(#paint11_linear_1570_18850)"
                                        />
                                        <path
                                            d="M0.547375 1.39062C0.547373 1.45516 0.563805 1.51863 0.595122 1.57505C0.62644 1.63147 0.67161 1.67899 0.726375 1.71313L7.39038 5.87862C7.42216 5.89849 7.45889 5.90903 7.49638 5.90903C7.53386 5.90903 7.57059 5.89849 7.60238 5.87862L14.2889 1.68762C14.3393 1.65621 14.381 1.61245 14.4098 1.56049C14.4387 1.50853 14.4539 1.45007 14.4539 1.39062C14.4539 1.15856 14.3617 0.936001 14.1976 0.771907C14.0335 0.607813 13.8109 0.515625 13.5789 0.515625H1.42188C1.18981 0.515625 0.967251 0.607813 0.803157 0.771907C0.639062 0.936001 0.546875 1.15856 0.546875 1.39062"
                                            fill="url(#paint12_linear_1570_18850)"
                                        />
                                        <path
                                            d="M0.547375 1.39062C0.547373 1.45516 0.563805 1.51863 0.595122 1.57505C0.62644 1.63147 0.67161 1.67899 0.726375 1.71313L7.39038 5.87862C7.42216 5.89849 7.45889 5.90903 7.49638 5.90903C7.53386 5.90903 7.57059 5.89849 7.60238 5.87862L14.2889 1.68762C14.3393 1.65621 14.381 1.61245 14.4098 1.56049C14.4387 1.50853 14.4539 1.45007 14.4539 1.39062C14.4539 1.15856 14.3617 0.936001 14.1976 0.771907C14.0335 0.607813 13.8109 0.515625 13.5789 0.515625H1.42188C1.18981 0.515625 0.967251 0.607813 0.803157 0.771907C0.639062 0.936001 0.546875 1.15856 0.546875 1.39062"
                                            fill="url(#paint13_linear_1570_18850)"
                                        />
                                        <path
                                            d="M0.547375 1.39062C0.547373 1.45516 0.563805 1.51863 0.595122 1.57505C0.62644 1.63147 0.67161 1.67899 0.726375 1.71313L7.39038 5.87862C7.42216 5.89849 7.45889 5.90903 7.49638 5.90903C7.53386 5.90903 7.57059 5.89849 7.60238 5.87862L14.2889 1.68762C14.3393 1.65621 14.381 1.61245 14.4098 1.56049C14.4387 1.50853 14.4539 1.45007 14.4539 1.39062C14.4539 1.15856 14.3617 0.936001 14.1976 0.771907C14.0335 0.607813 13.8109 0.515625 13.5789 0.515625H1.42188C1.18981 0.515625 0.967251 0.607813 0.803157 0.771907C0.639062 0.936001 0.546875 1.15856 0.546875 1.39062"
                                            fill="url(#paint14_radial_1570_18850)"
                                        />
                                    </g>
                                    <defs>
                                        <filter id="filter0_i_1570_18850" x="0.546875" y="4.71484" width="13.9072" height="5.76855" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                            <feOffset dy="-0.375" />
                                            <feGaussianBlur stdDeviation="0.375" />
                                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                            <feColorMatrix type="matrix" values="0 0 0 0 0.819608 0 0 0 0 0.654902 0 0 0 0 0.933333 0 0 0 1 0" />
                                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1570_18850" />
                                        </filter>
                                        <filter id="filter1_ii_1570_18850" x="0.546875" y="0.440625" width="13.9072" height="5.59355" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                            <feOffset dy="-0.075" />
                                            <feGaussianBlur stdDeviation="0.1125" />
                                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                            <feColorMatrix type="matrix" values="0 0 0 0 0.827451 0 0 0 0 0.686275 0 0 0 0 0.913725 0 0 0 1 0" />
                                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1570_18850" />
                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                            <feOffset dy="0.125" />
                                            <feGaussianBlur stdDeviation="0.15" />
                                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                            <feColorMatrix type="matrix" values="0 0 0 0 0.870588 0 0 0 0 0.858824 0 0 0 0 0.854902 0 0 0 1 0" />
                                            <feBlend mode="normal" in2="effect1_innerShadow_1570_18850" result="effect2_innerShadow_1570_18850" />
                                        </filter>
                                        <linearGradient id="paint0_linear_1570_18850" x1="1.54785" y1="6.07813" x2="14.4539" y2="5.98413" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#DFD0E6" />
                                            <stop offset="1" stopColor="#EEE5F8" />
                                        </linearGradient>
                                        <linearGradient id="paint1_linear_1570_18850" x1="0.547852" y1="6.04712" x2="2.06685" y2="6.04712" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#D6BABD" />
                                            <stop offset="1" stopColor="#DCC9DD" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint2_linear_1570_18850" x1="4.91935" y1="6.98613" x2="4.53835" y2="6.39263" gradientUnits="userSpaceOnUse">
                                            <stop offset="0.114" stopColor="#DAC3DF" />
                                            <stop offset="1" stopColor="#DAC3DF" stopOpacity="0" />
                                        </linearGradient>
                                        <radialGradient
                                            id="paint3_radial_1570_18850"
                                            cx="0"
                                            cy="0"
                                            r="1"
                                            gradientUnits="userSpaceOnUse"
                                            gradientTransform="translate(5.56298 4.18977) rotate(123.69) scale(1.36262 9.56975)"
                                        >
                                            <stop offset="0.342" stopColor="#C8A6D7" />
                                            <stop offset="1" stopColor="#D1BBDD" stopOpacity="0" />
                                        </radialGradient>
                                        <linearGradient id="paint4_linear_1570_18850" x1="10.047" y1="7.14063" x2="10.462" y2="6.39263" gradientUnits="userSpaceOnUse">
                                            <stop offset="0.114" stopColor="#F6EFFE" />
                                            <stop offset="1" stopColor="#F3EAFD" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint5_linear_1570_18850" x1="9.578" y1="4.46863" x2="10.1095" y2="5.18713" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#E3CDF7" />
                                            <stop offset="1" stopColor="#E9D9F8" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint6_linear_1570_18850" x1="14.547" y1="7.28113" x2="12.6875" y2="7.28113" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#F7F3FB" />
                                            <stop offset="1" stopColor="#F0E9F8" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint7_linear_1570_18850" x1="14.547" y1="7.28113" x2="13.934" y2="7.28113" gradientUnits="userSpaceOnUse">
                                            <stop offset="0.199" stopColor="#EBE9ED" />
                                            <stop offset="1" stopColor="#EBE9ED" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint8_linear_1570_18850" x1="7.50038" y1="11.3587" x2="7.50038" y2="5.95274" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#DDC5F1" />
                                            <stop offset="1" stopColor="#E6DAF1" />
                                        </linearGradient>
                                        <linearGradient id="paint9_linear_1570_18850" x1="3.24337" y1="7.55274" x2="3.47137" y2="7.89474" gradientUnits="userSpaceOnUse">
                                            <stop offset="0.073" stopColor="#DDC2C8" />
                                            <stop offset="1" stopColor="#DFCDDA" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint10_linear_1570_18850" x1="10.7909" y1="7.07874" x2="10.6474" y2="7.30224" gradientUnits="userSpaceOnUse">
                                            <stop offset="0.14" stopColor="#F8F3FD" />
                                            <stop offset="1" stopColor="#F1EAF9" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint11_linear_1570_18850" x1="7.50037" y1="0.515625" x2="7.50037" y2="5.90912" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#E9E4E9" />
                                            <stop offset="1" stopColor="#E7DCF0" />
                                        </linearGradient>
                                        <linearGradient id="paint12_linear_1570_18850" x1="4.40537" y1="3.93863" x2="6.21237" y2="0.696125" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#E1D5E7" />
                                            <stop offset="1" stopColor="#E1D5E7" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="paint13_linear_1570_18850" x1="0.547375" y1="1.33412" x2="2.01337" y2="1.33412" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#E1C1BC" />
                                            <stop offset="1" stopColor="#E9D1CD" stopOpacity="0" />
                                        </linearGradient>
                                        <radialGradient
                                            id="paint14_radial_1570_18850"
                                            cx="0"
                                            cy="0"
                                            r="1"
                                            gradientUnits="userSpaceOnUse"
                                            gradientTransform="translate(13.2288 2.55699) rotate(-138.233) scale(3.06453 13.5789)"
                                        >
                                            <stop stopColor="#FBF9FE" />
                                            <stop offset="1" stopColor="#F0ECF1" stopOpacity="0" />
                                        </radialGradient>
                                    </defs>
                                </svg>

                                <span className="text-sm font-medium text-gray-700">Message:</span>
                            </div>
                            <span className="text-sm text-gray-600">{getContactPhoneNumber(contact[0])}</span>
                        </div>
                        {/* <IconEdit size={16} className="text-gray-400 cursor-pointer" /> */}
                    </div>

                    {contact[0]?.lead?.email && (
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className=" flex items-center justify-center">
                                        <svg className="w-4 h-4" width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12.5 2H0.5V8C0.5 8.53043 0.710714 9.03914 1.08579 9.41421C1.46086 9.78929 1.96957 10 2.5 10H10.5C11.0304 10 11.5391 9.78929 11.9142 9.41421C12.2893 9.03914 12.5 8.53043 12.5 8V2Z"
                                                fill="#367AF2"
                                            />
                                            <path
                                                d="M12.5 2H0.5V8C0.5 8.53043 0.710714 9.03914 1.08579 9.41421C1.46086 9.78929 1.96957 10 2.5 10H10.5C11.0304 10 11.5391 9.78929 11.9142 9.41421C12.2893 9.03914 12.5 8.53043 12.5 8V2Z"
                                                fill="url(#paint0_linear_1570_18876)"
                                            />
                                            <path
                                                d="M12.5 2H0.5V8C0.5 8.53043 0.710714 9.03914 1.08579 9.41421C1.46086 9.78929 1.96957 10 2.5 10H10.5C11.0304 10 11.5391 9.78929 11.9142 9.41421C12.2893 9.03914 12.5 8.53043 12.5 8V2Z"
                                                fill="url(#paint1_linear_1570_18876)"
                                            />
                                            <path
                                                d="M12.5 2H0.5V8C0.5 8.53043 0.710714 9.03914 1.08579 9.41421C1.46086 9.78929 1.96957 10 2.5 10H10.5C11.0304 10 11.5391 9.78929 11.9142 9.41421C12.2893 9.03914 12.5 8.53043 12.5 8V2Z"
                                                fill="url(#paint2_linear_1570_18876)"
                                                fillOpacity="0.75"
                                            />
                                            <path
                                                d="M12.5 2H0.5V8C0.5 8.53043 0.710714 9.03914 1.08579 9.41421C1.46086 9.78929 1.96957 10 2.5 10H10.5C11.0304 10 11.5391 9.78929 11.9142 9.41421C12.2893 9.03914 12.5 8.53043 12.5 8V2Z"
                                                fill="url(#paint3_linear_1570_18876)"
                                                fillOpacity="0.7"
                                            />
                                            <path
                                                d="M2.5 0C1.96957 0 1.46086 0.210714 1.08579 0.585786C0.710714 0.960859 0.5 1.46957 0.5 2V2.84L6.263 5.943C6.33584 5.98221 6.41727 6.00274 6.5 6.00274C6.58273 6.00274 6.66416 5.98221 6.737 5.943L12.5 2.84V2C12.5 1.46957 12.2893 0.960859 11.9142 0.585786C11.5391 0.210714 11.0304 0 10.5 0H2.5Z"
                                                fill="url(#paint4_linear_1570_18876)"
                                            />
                                            <defs>
                                                <linearGradient id="paint0_linear_1570_18876" x1="8.023" y1="3.568" x2="11.526" y2="9.814" gradientUnits="userSpaceOnUse">
                                                    <stop offset="0.228" stopColor="#0094F0" stopOpacity="0" />
                                                    <stop offset="0.431" stopColor="#0094F0" />
                                                </linearGradient>
                                                <linearGradient id="paint1_linear_1570_18876" x1="4.786" y1="2.842" x2="0.894" y2="10.198" gradientUnits="userSpaceOnUse">
                                                    <stop offset="0.228" stopColor="#0094F0" stopOpacity="0" />
                                                    <stop offset="0.431" stopColor="#0094F0" />
                                                </linearGradient>
                                                <linearGradient id="paint2_linear_1570_18876" x1="9.664" y1="6.773" x2="10.256" y2="10.726" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#2764E7" stopOpacity="0" />
                                                    <stop offset="1" stopColor="#2764E7" />
                                                </linearGradient>
                                                <linearGradient id="paint3_linear_1570_18876" x1="8.357" y1="2.982" x2="9.438" y2="11.034" gradientUnits="userSpaceOnUse">
                                                    <stop offset="0.533" stopColor="#FF6CE8" stopOpacity="0" />
                                                    <stop offset="1" stopColor="#FF6CE8" />
                                                </linearGradient>
                                                <linearGradient id="paint4_linear_1570_18876" x1="4.065" y1="-2.493" x2="10.816" y2="9.725" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#6CE0FF" />
                                                    <stop offset="0.462" stopColor="#29C3FF" />
                                                    <stop offset="1" stopColor="#4894FE" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Mail</span>
                                </div>
                                <span className="text-sm text-gray-600 break-all">{contact[0]?.lead.email || 'N/A'}</span>
                            </div>
                            {/* <IconEdit size={16} className="text-gray-400 cursor-pointer" /> */}
                        </div>
                    )}

                    {/* Action Buttons */}

                    <div className={`flex ${isMobile ? 'justify-center' : ''} gap-4 pt-4`}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                loading={isCreating}
                                onClick={() => {
                                    if (contact[0]?.lead?.conversation && contact[0]?.lead?.conversation[0]?.id) {
                                        navigate(`/chats?id=${contact[0]?.lead?.conversation[0]?.id}`);
                                        return;
                                    } else {
                                        if (contact[0]?.lead?.id) {
                                            createConversation({
                                                leadId: contact[0]?.lead?.id,
                                                name: null,
                                            })
                                                .unwrap()
                                                .then((response) => {
                                                    showNotification({
                                                        title: 'Success!',
                                                        message: response.message || 'Conversation created successfully.',
                                                        color: 'green',
                                                    });
                                                    try {
                                                        navigate(`/chats?id=${response?.conversation?.id}`);
                                                    } catch (error) {
                                                        console.error('Navigation error:', error);
                                                        showNotification({
                                                            title: 'Error!',
                                                            message: 'Failed to navigate to the chat. Please try again later.',
                                                            color: 'red',
                                                        });
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.error('Error creating conversation:', error);
                                                    showNotification({
                                                        title: 'Error!',
                                                        message: error?.data?.message || 'Failed to create conversation. Please try again later.',
                                                        color: 'red',
                                                    });
                                                });
                                        } else {
                                            navigate('/chats', {
                                                state: {
                                                    phone: getContactPhoneNumber(contact[0]),
                                                },
                                            });
                                        }
                                    }
                                }}
                                variant="outline"
                                size={isMobile ? 'default' : 'sm'}
                                className="flex items-center gap-2"
                            >
                                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8.75069 0.5C3.92569 0.5 0.00069162 3.69625 0.00069162 7.625C0.00069162 8.61493 0.24815 9.57423 0.71414 10.4537C1.54962 12.0305 2.20694 14.4651 0.474441 14.8925C0.173192 14.9675 -0.0280584 15.2525 0.00319162 15.5612C0.0344416 15.8712 0.288192 16.11 0.599441 16.1237C0.613191 16.1237 0.666941 16.1262 0.756941 16.1262C1.25585 16.1262 2.85659 16.0644 4.86326 15.3604C6.10538 14.9247 7.43435 14.75 8.75069 14.75C13.5744 14.75 17.5007 11.5537 17.5007 7.625C17.5007 3.69625 13.5744 0.5 8.75069 0.5Z"
                                        fill="#6B6B6B"
                                    />
                                    <path
                                        d="M19.526 19.2212C18.2712 18.912 18.5782 17.2564 19.242 16.1476C19.7365 15.3217 20.001 14.4036 20.001 13.4525C20.001 11.5913 17.5687 11.9049 16.2153 13.1825C14.3857 14.9097 11.72 16 8.75098 16C8.20909 16 7.6729 15.9638 7.14906 15.8924C6.99951 15.872 6.841 15.8972 6.70407 15.9607C6.27838 16.1582 6.11535 16.686 6.42671 17.0371C7.79028 18.5746 10.0041 19.5775 12.501 19.5775C13.6058 19.5775 14.7184 19.733 15.7733 20.0615C16.9221 20.4193 17.9185 20.5008 18.5885 20.5C19.116 20.5 19.441 20.45 19.4772 20.4437C19.7697 20.3962 19.9885 20.1487 20.001 19.8525C20.0122 19.5562 19.8147 19.2912 19.526 19.2212Z"
                                        fill="#6B6B6B"
                                    />
                                </svg>

                                {isMobile && 'Message'}
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size={isMobile ? 'default' : 'sm'} className="flex items-center gap-2" onClick={handleStartCall}>
                                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M16.0245 20.4998C15.1531 20.4998 13.929 20.1846 12.0959 19.1605C9.86688 17.9105 8.14276 16.7565 5.92576 14.5453C3.78824 12.4091 2.74805 11.0261 1.29223 8.37691C-0.352435 5.3858 -0.0720746 3.81793 0.241322 3.14783C0.614541 2.34693 1.16544 1.86791 1.8775 1.39245C2.28195 1.12747 2.70995 0.900313 3.15609 0.713874C3.20073 0.694677 3.24225 0.676374 3.2793 0.659856C3.50029 0.560301 3.83512 0.409853 4.25923 0.570569C4.54227 0.67682 4.79495 0.894233 5.19049 1.28486C6.00166 2.08487 7.11015 3.86659 7.51909 4.7416C7.79364 5.33134 7.97534 5.72063 7.97579 6.15724C7.97579 6.66841 7.71864 7.06261 7.40659 7.48806C7.3481 7.56797 7.29007 7.64431 7.23382 7.71842C6.89408 8.16486 6.81953 8.29388 6.86863 8.52424C6.96819 8.98719 7.71061 10.3653 8.93071 11.5828C10.1508 12.8002 11.4892 13.4957 11.954 13.5948C12.1941 13.6462 12.3258 13.5685 12.7866 13.2167C12.8526 13.1663 12.9205 13.114 12.9915 13.0618C13.4674 12.7078 13.8433 12.4573 14.3424 12.4573H14.3451C14.7794 12.4573 15.1513 12.6457 15.7674 12.9564C16.571 13.3618 18.4063 14.456 19.2112 15.2681C19.6027 15.6627 19.821 15.9145 19.9277 16.1971C20.0884 16.6225 19.9371 16.956 19.8384 17.1792C19.8219 17.2163 19.8036 17.2569 19.7844 17.302C19.5965 17.7474 19.368 18.1745 19.1018 18.5779C18.6273 19.2878 18.1464 19.8373 17.3438 20.211C16.9316 20.406 16.4805 20.5047 16.0245 20.4998Z"
                                        fill="#6B6B6B"
                                    />
                                </svg>

                                {isMobile && 'Call'}
                            </Button>
                        </motion.div>
                    </div>

                    {/* Status Section */}
                    {/* <div className="pt-4 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-500 mb-2 block">Status:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-500">{contact.every((c) => c.status === 'failed') ? 'Inactive' : 'Active'}</span>
                        </div>
                    </div> */}

                    {/* Call History */}
                </div>
                <div className={`p-${isMobile ? '4' : '6'} flex flex-grow flex-col overflow-hidden gap-4`}>
                    <CallLogsSection callLogs={contactCallLogs} onCallBack={handleCallBack} />
                </div>
            </div>
        </motion.div>
    );
});

ContactDetails.displayName = 'ContactDetails';

export { ContactDetails };
