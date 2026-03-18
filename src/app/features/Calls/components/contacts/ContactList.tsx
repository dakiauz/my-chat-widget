import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { filterContacts, groupContactsByLetter, formatTimeAgo } from '../../utils/helpers';
import { setSelectedContact } from '../../../../slices/uiSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { IContact } from '../../models/calls';
import { formatPhoneNumber, getInitials } from '../../../../shared/utils/utils';
import { setDialerOpen } from '../../../../slices/dialerSlice';
import IconChatDot from '../../../../../_theme/components/Icon/IconChatDot';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useGetCallContactsQuery } from '../../../Integrations/services/TwillioApiSlice';
import { useGetIntegrationsQuery } from '../../../Integrations/services/IntegrationApi';
import IconPhone from '@/_theme/components/Icon/IconPhone';

const ContactList = () => {
    const dispatch = useDispatch();
    const { data: ContactsData, isFetching: ContactsFetching } = useGetCallContactsQuery();
    const contacts = useMemo(() => {
        return ContactsData?.contacts ?? [];
    }, [ContactsData?.contacts]);
    const { selectedContact: selectedContact, isMobile, currentView } = useSelector((state: IRootState) => state.ui);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredContacts = useMemo(() => filterContacts(contacts, searchQuery), [contacts, searchQuery]);


    const handleContactSelect = (contact: IContact) => {
        dispatch(setSelectedContact(contact));
    };

    if (isMobile && currentView !== 'contacts') return null;
    const { data: socialsData, isFetching } = useGetIntegrationsQuery();
    const twilioSocialNumber = useMemo(() => socialsData?.socails?.twilioPhoneNumber?.phoneNumber, [socialsData]);

    return (
        <div className={`${isMobile ? 'w-full' : 'w-full'} h-full flex flex-col`}>
            <motion.div
                className="h-full flex flex-col bg-white  p-4 gap-2 "
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                {/* Contacts Header */}
                <div className="flex-col gap-4">
                    <motion.div className="flex flex-col gap-1" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-center justify-between gap-4 ">
                            <div>
                                <h2 className="font-semibold text-gray-900">Contacts</h2>
                                {twilioSocialNumber && <p className=" text-center text-xsm text-gray-500">Your Number: {twilioSocialNumber}</p>}
                                <p className="text-xsm text-gray-500"> {contacts.length ?? 0} Contacts</p>
                            </div>
                        </div>
                        {/* Search */}
                        <div className="my-3">
                            <div className="relative">
                                <svg
                                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search Contact"
                                    className="py-2  w-full rounded-md border border-gray-200 bg-gray-50 pl-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {/* {searchQuery && (
                        <button className="absolute right-7 top-[52%] -translate-y-1/2 transform text-gray-400 hover:text-gray-600" onClick={() => setSearchQuery('')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )} */}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Special Items */}

                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <div className="space-y-2">
                        {[
                            {
                                icon: IconPhone,
                                label: 'New Lead',
                                onClick: (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    dispatch(setDialerOpen(true));
                                },
                            },
                        ].map((item, index) => (
                            <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <div onClick={item.onClick} className="flex items-center gap-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="w-10 h-10 bg-green-800/80 rounded-lg flex items-center justify-center">
                                        <item.icon fill={true} duotone={false} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold font-urbanist text-gray-900">{item.label}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Contact List */}
                <PerfectScrollbar className="flex-1" options={{ suppressScrollX: true }}>
                    <AnimatePresence>
                        <div className="flex flex-col px-2 pb-4">
                            {filteredContacts.map((contact, index) => {
                                const isMissed = contact.status === 'no-answer' || contact.status === 'busy' || contact.status === 'failed' || contact.status === 'canceled' || contact.status === 'missed';
                                const displayTime = formatTimeAgo(contact.created_at);
                                const directionText = contact.direction === 'OUTBOUND' ? 'Outbound' : 'Inbound';
                                const hasMissedCount = isMissed && contact.missed_calls_count && contact.missed_calls_count > 0;
                                const hasTotalCount = contact.total_calls_count && contact.total_calls_count > 1;
                                const countText = hasMissedCount ? `(${contact.missed_calls_count})` : hasTotalCount ? `(${contact.total_calls_count})` : '';

                                return (
                                    <motion.div
                                        key={contact.id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div
                                            className={`flex items-center gap-3 rounded-lg cursor-pointer hover:bg-gray-50 px-2 py-3 border-b border-gray-100 last:border-0 ${selectedContact && getContactPhoneNumber(selectedContact) == getContactPhoneNumber(contact) ? 'bg-gray-50' : ''
                                                }`}
                                            onClick={() => handleContactSelect(contact)}
                                        >
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                                <span className="text-md font-bold text-green-800/80">{getInitials(getContactNameWithoutFormatting(contact))}</span>
                                            </div>

                                            <div className="flex flex-col flex-grow truncate min-w-0">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className={`text-sm font-[600] font-urbanist flex gap-2 items-center truncate ${isMissed ? 'text-[#FA5532]' : 'text-gray-900'}`}>
                                                        <img
                                                            className="w-4 h-4 shrink-0"
                                                            alt={getContactFlag(contact)}
                                                            src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${getContactFlag(contact)}.svg`}
                                                        />
                                                        <span className="truncate">{getContactName(contact)} {countText}</span>
                                                    </span>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{displayTime}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                    {isMissed ? (
                                                        <span className="text-[#FA5532]">Missed</span>
                                                    ) : (
                                                        <span>{directionText}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                </PerfectScrollbar>
            </motion.div>
        </div>
    );
};

ContactList.displayName = 'ContactList';

export { ContactList };

export const getContactNameWithoutFormatting = (contact: IContact): string => {
    return contact.lead ? `${contact.lead.firstName} ${contact.lead.lastName ?? ''}` : contact.direction === 'OUTBOUND' ? contact.to : contact.from;
};

export const getContactName = (contact: IContact): string => {
    const { display, countryCode } = formatPhoneNumber(contact.lead ? `${contact.lead.firstName} ${contact.lead.lastName ?? ''}` : contact.direction === 'OUTBOUND' ? contact.to : contact.from);
    return display;
};

export const getContactFlag = (contact: IContact): string => {
    const { countryCode } = formatPhoneNumber(contact.lead ? `${contact.lead.firstName} ${contact.lead.lastName ?? ''}` : contact.direction === 'OUTBOUND' ? contact.to : contact.from);
    return countryCode ? countryCode : '';
};

export const getNumberFlag = (phoneNumber: string): string => {
    const { countryCode } = formatPhoneNumber(phoneNumber);
    return countryCode ? countryCode : '';
};

export const getContactPhoneNumber = (contact: IContact | null): string => {
    if (!contact) return '';
    return contact.lead ? contact.lead.phone : contact.direction === 'OUTBOUND' ? contact.to : contact.from;
};
