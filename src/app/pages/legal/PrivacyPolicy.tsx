import React from 'react';

const PrivacyPolicy: React.FC = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <header className="mb-10 border-b border-indigo-200 pb-5 text-center">
            {/* Reduced h1 from text-5xl to text-4xl */}
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                Privacy Policy for Dakia
            </h1>
           
        </header>

        {/* Reduced text from text-lg to text-base for general readability, kept text-lg for this intro box for emphasis */}
        <p className="mb-10 text-sm text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
            This Privacy Policy describes how Dakia ("we," "us," or "our") collects, uses, and discloses your
            information when you use our web application (the "Service"). This policy is specifically designed to be compliant with the Meta Platform Terms.
        </p>

        {/* 1. Information We Collect */}
        <section className="mb-10">
            {/* Reduced h2 from text-3xl to text-2xl */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                1. Information We Collect
            </h2>
            {/* Reduced text from text-lg to text-base */}
            <p className="mb-4 text-base text-gray-700">We collect several types of information to provide and improve our Service:</p>
            {/* List text remains default size, effectively text-base */}
            <ul className="list-disc pl-8 space-y-3 text-gray-700">
                <li className="p-3 bg-gray-50 rounded-md">
                    <strong className="text-gray-900">Facebook Form Data:</strong> To connect our Service, you must authenticate your Facebook account and grant us permission to access your specific Facebook Page(s). Once connected, we collect information your leads have submitted through your Facebook Lead Ads forms, which may include, but is not limited to, names, email addresses, and phone numbers.
                </li>
                <li className="p-3 bg-gray-50 rounded-md">
                    <strong className="text-gray-900">Account Information:</strong> When you register for dakia, we collect your name, email address, phone number, and company information.
                </li>
                <li className="p-3 bg-gray-50 rounded-md">
                    <strong className="text-gray-900">Communication & CRM Data:</strong> We store and process data related to your communications (calls, emails, SMS logs) and any customer or lead information you manage within the dakia platform.
                </li>
                <li className="p-3 bg-gray-50 rounded-md">
                    <strong className="text-gray-900">Usage Data:</strong> We automatically collect technical information when you use our Service, such as your IP address, device type, and browsing activity (pages viewed, features used).
                </li>
            </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 2. How We Use Your Information */}
        <section className="mb-10">
            {/* Reduced h2 from text-3xl to text-2xl */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                2. How We Use Your Information
            </h2>
            {/* Reduced text from text-lg to text-base */}
            <p className="mb-4 text-base text-gray-700">We use the information we collect for the following purposes:</p>
            {/* List text remains default size, effectively text-base */}
            <ol className="list-decimal pl-8 space-y-3 text-gray-700">
                <li>
                    <strong className="text-gray-900">To Provide the Service:</strong> To pull lead data from your Facebook forms and enable you to manage communications from our centralized platform.
                </li>
                <li>
                    <strong className="text-gray-900">To Improve Our Service:</strong> To analyze usage data to understand how our Service is used and how we can improve it.
                </li>
                <li>
                    <strong className="text-gray-900">Support and Account Management:</strong> To manage your account, provide customer support, and send you important notifications, billing information, and security alerts.
                </li>
                <li>
                    <strong className="text-gray-900">Legal Compliance:</strong> To comply with applicable legal obligations and enforce our terms.
                </li>
            </ol>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 3. Data Sharing and Disclosure */}
        <section className="mb-10">
            {/* Reduced h2 from text-3xl to text-2xl */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                3. Data Sharing and Disclosure
            </h2>
            {/* Kept text-lg for emphasis on this key point, but reduced padding and margin slightly */}
            <p className="mt-3 text-sm text-gray-700 leading-relaxed p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                We do not sell your personal data. We only share your information with trusted third-party service providers who assist us in operating our Service (such as for data hosting). These providers are bound by strict confidentiality agreements and are only permitted to use your information to perform services on our behalf.
            </p>
        </section>

        {/* 4. Data Security */}
        <section className="mb-10">
            {/* Reduced h2 from text-3xl to text-2xl */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                4. Data Security
            </h2>
            {/* Reduced text from text-lg to text-base */}
            <p className="mt-3 text-base text-gray-700 leading-relaxed">
                We are committed to protecting your data. We implement industry-standard security measures, including encryption and strict access controls, to safeguard your information from unauthorized access, use, or disclosure.
            </p>
        </section>

        {/* 5. Data Retention and Your Rights */}
        <section className="mb-10">
            {/* Reduced h2 from text-3xl to text-2xl */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                5. Data Retention and Your Rights
            </h2>
            {/* Reduced text from text-lg to text-base */}
            <p className="mb-4 text-base text-gray-700 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide our services. You have the right to:
            </p>
            {/* List text remains default size, effectively text-base */}
            <ul className="list-disc pl-8 space-y-3 text-gray-700">
                <li>
                    <strong className="text-gray-900">Access:</strong> Request access to the personal data we hold about you.
                </li>
                <li>
                    <strong className="text-gray-900">Correct:</strong> Request corrections to any inaccurate or incomplete data.
                </li>
                <li>
                    <strong className="text-gray-900">Delete:</strong> Request the deletion of your personal data from our systems.
                </li>
            </ul>
            {/* Reduced text from text-lg to text-base */}
            <p className="mt-4 text-base text-gray-700 leading-relaxed">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:support@dakia.ai" className="text-indigo-600 hover:text-indigo-800 underline font-semibold transition duration-150 ease-in-out">
                    support@dakia.ai
                </a>
                . We will respond to your request in a timely manner.
            </p>
        </section>

        {/* 6. Changes to This Privacy Policy */}
        <section className="mb-10">
            {/* Reduced h2 from text-3xl to text-2xl */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                6. Changes to This Privacy Policy
            </h2>
            {/* Reduced text from text-lg to text-base */}
            <p className="mt-3 text-base text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
        </section>

        {/* 7. Contact Us */}
        <section>
            {/* Reduced h2 from text-3xl to text-2xl */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                7. Contact Us
            </h2>
            {/* Reduced text from text-lg to text-base */}
            <p className="mt-3 text-base text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:support@dakia.ai" className="text-indigo-600 hover:text-indigo-800 underline font-semibold transition duration-150 ease-in-out">
                    support@dakia.ai
                </a>
                .
            </p>
        </section>
    </div>
);

export default PrivacyPolicy;