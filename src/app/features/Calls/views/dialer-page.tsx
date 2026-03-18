import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactList, getContactName, getContactNameWithoutFormatting, getContactPhoneNumber } from '../components/contacts/ContactList';
import { ContactDetails } from '../components/contacts/ContactDetails';
import { FloatingDialer } from '../components/floating/floating-dialer';
import { FloatingActionButtons } from '../components/floating/floating-action-buttons';
import ErrorBoundary from '../components/error-boundary';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { LoadingOverlay, Skeleton } from '@mantine/core';
import { useGetCallContactHistoryQuery, useGetCallContactsQuery } from '../../Integrations/services/TwillioApiSlice';
import { CallLog } from '../types';
import { IContact } from '../models/calls';
import { getInitials } from '../../../shared/utils/utils';
import { useDispatch } from 'react-redux';
import { setCallLogs } from '../../../slices/callLogsSlice';
import { setSelectedContact } from '../../../slices/uiSlice';
import CreateNewCall from '../components/CreateNewCall';
import { useLocation } from 'react-router-dom';
import { setDialerOpen, setNumber } from '../../../slices/dialerSlice';
import { useCallEvents } from '../hooks/useCallEvents';

const DialerPageContent = React.memo(() => {
    useCallEvents(); // Initialize real-time call event listeners
    const { selectedContact: selectedContactPhoneNumber, isMobile, currentView } = useSelector((state: IRootState) => state.ui);

    const phoneNumber = getContactPhoneNumber(selectedContactPhoneNumber) ?? '';

    const { data: callLogsData, isFetching: callLogsFetching } = useGetCallContactHistoryQuery(phoneNumber, {
        skip: !phoneNumber, // ✅ Only fetch if phone number is non-empty
    });

    const dispatch = useDispatch();

    const selectedContactCallLog = React.useMemo(() => {
        if (!callLogsData?.history) return null;
        return callLogsData.history ?? [];
    }, [callLogsData?.history]);

    const { data: ContactsData, isFetching: ContactsFetching, isLoading: ContactsLoading, refetch } = useGetCallContactsQuery();
    const callState = useSelector((state: IRootState) => state.dialer.callState);

    const location = useLocation();

    useEffect(() => {
        if (location.state?.phone) {
            dispatch(setDialerOpen(true));
            dispatch(setNumber(location.state?.phone));
        }
    }, [location.state?.phone]);

    useEffect(() => {
        if (selectedContactCallLog) return;
        if (ContactsData?.contacts && ContactsData.contacts.length > 0) {
            const phoneFromState = location.state?.phone;
            const foundContact = ContactsData.contacts.find((contact: IContact) => getContactPhoneNumber(contact) == phoneFromState);
            if (foundContact) {
                dispatch(setSelectedContact(foundContact));
            } else {
                const firstContact = ContactsData.contacts[0];
                dispatch(setSelectedContact(firstContact));
            }
        }
    }, [ContactsData?.contacts]);



    useEffect(() => {
        if (!selectedContactCallLog) return;
        const callLogs: CallLog[] = selectedContactCallLog.map((contact: IContact) => ({
            id: contact.id + '',
            callSid: contact.callSid,
            contactId: getContactName(contact),
            contactName: getContactName(contact),
            contactInitials: getInitials(getContactNameWithoutFormatting(contact)),
            phone: getContactPhoneNumber(contact),
            type: contact.status != 'completed' ? 'missed' : contact.direction == 'INBOUND' ? 'incoming' : 'outgoing',
            callDuration: contact.callDuration ?? '',
            timestamp: new Date(contact.created_at).toISOString(),
            status: contact.status == 'completed' ? 'completed' : contact.status == 'no-answer' ? 'missed' : 'declined',
            recording: contact.recording,
        }));
        dispatch(setCallLogs(callLogs));
    }, [selectedContactCallLog]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] min-h-[600px] bg-gray-50 p-4 container gap-4">
            {/* Header */}

            <div className="flex items-center justify-between ">
                <div className="flex items-center gap-4">
                    <span className="w-[16px] rounded-[4px]  h-[30px] bg-primary"></span>
                    <h1 className="text-xl font-semibold">Conversations</h1>
                </div>
                <CreateNewCall variant="button" />
            </div>

            <div className=" rounded-2xl flex flex-grow overflow-hidden shadow-md ">
                {/* Contact List */}
                {(!isMobile || currentView === 'contacts') && (
                    <motion.div
                        key="contact-list"
                        initial={{ x: isMobile ? -100 : 0, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: isMobile ? -100 : 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={isMobile ? 'w-full' : 'flex-1 flex flex-grow w-full '}
                    >
                        {ContactsLoading || (selectedContactPhoneNumber && !callLogsData?.history) ? (
                            <div className="p-4 bg-white w-full h-full ">
                                <div className="animate-pulse space-y-4">
                                    <div className="flex items-center justify-between mb-10 mt-4">
                                        <Skeleton className="h-10 w-full mx-auto" />
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        {Array.from({ length: Math.floor(window.innerHeight / 100) }).map((_, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-300/70 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ContactList />
                        )}
                    </motion.div>
                )}

                {/* Contact Details */}
                {selectedContactCallLog && (!isMobile || currentView === 'contact-detail') && (
                    <motion.div
                        key="contact-detail"
                        initial={{ x: isMobile ? 100 : 0, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: isMobile ? 100 : 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className=" relative flex flex-grow  bg-white border-l  sm:max-w-[450px]"
                    >
                        <LoadingOverlay visible={callLogsFetching} overlayBlur={2} />
                        <ContactDetails contact={selectedContactCallLog} fetching={callLogsFetching} />
                    </motion.div>
                )}
            </div>

            {/* Floating Components */}
            {/* <FloatingDialer />
            <FloatingActionButtons /> */}
        </div>
    );
});

export default function DialerPage() {
    return (
        <ErrorBoundary>
            <DialerPageContent />
        </ErrorBoundary>
    );
}
