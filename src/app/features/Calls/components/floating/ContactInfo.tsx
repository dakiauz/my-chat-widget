import { motion } from 'framer-motion';

const ContactInfo = ({ contact, dialerState, duration, formatPhoneNumber }: { contact: any; dialerState: string; duration: string; formatPhoneNumber: (number: string) => string }) => (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="p-8 text-center border-b border-gray-200">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl text-white">{contact.initials}</span>
            </div>
            <h3 className="text-xl font-semibold mb-1">{contact.name}</h3>
            <p className="text-gray-500 mb-4">{formatPhoneNumber(contact.phone || '')}</p>
            {dialerState === 'active' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{duration}</span>}
            {dialerState === 'incoming' && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Incoming call...</span>}
            {dialerState === 'dialing' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Calling...</span>}
        </div>
    </motion.div>
);

export default ContactInfo;
