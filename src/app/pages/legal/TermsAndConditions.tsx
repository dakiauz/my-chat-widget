import React from 'react';

const TermsAndConditions: React.FC = () => (
    <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-blue mb-2">Terms of Service</h1>
        </header>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">1. Account Eligibility and Responsibilities</h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-800">
                <li>
                    <span className="font-semibold">Eligibility:</span> You must be at least 18 years of age and have the legal capacity to enter into a binding contract to use the Service.
                </li>
                <li>
                    <span className="font-semibold">Account Information:</span> You agree to provide and maintain true, accurate, current, and complete information about yourself as prompted by the Service's registration form.
                </li>
                <li>
                    <span className="font-semibold">Account Security:</span> You are solely responsible for maintaining the confidentiality of your account password and other login credentials.
                </li>
                <li>
                    You are fully responsible for any and all activities that occur under your account and must notify us immediately of any unauthorized use.
                </li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">2. Use of the Service (Acceptable Use)</h2>
            <p className="mt-4 text-gray-800">
                We grant you a limited, non-exclusive, non-transferable, and revocable license to use the Service in accordance with these Terms.
            </p>
            <p className="mt-4 text-gray-800 font-semibold">
                Prohibited Activities:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2 text-gray-800">
                <li>Engaging in any activity that is illegal, fraudulent, or harmful.</li>
                <li>Sending unsolicited communications, promotions, advertising, or spam.</li>
                <li>
                    Violating any laws regarding marketing communications, including but not limited to the TCPA, CAN-SPAM Act, and GDPR.
                </li>
                <li>Attempting to reverse-engineer, decompile, or otherwise discover the source code.</li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">3. Billing, Subscriptions, and Payment</h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-800">
                <li>
                    <span className="font-semibold">Fees:</span> You agree to pay all fees for your chosen plan in a timely manner (quoted in U.S. Dollars unless otherwise specified).
                </li>
                <li>
                    <span className="font-semibold">Automatic Renewal:</span> Your subscription will automatically renew at the end of each billing cycle for uninterrupted service.
                </li>
                <li>
                    <span className="font-semibold">Price Changes:</span> We reserve the right to change fees and will provide you with at least 30 days' notice.
                </li>
                <li>
                    <span className="font-semibold">Non-Payment:</span> Failure to pay may result in the suspension or termination of your access to paid features. All fees are non-refundable except as required by law.
                </li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">4. Intellectual Property</h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-800">
                <li>
                    <span className="font-semibold">Our Property:</span> The Service and its content, features, and functionality are the exclusive property of dakia.ai and its licensors.
                </li>
                <li>
                    <span className="font-semibold">Your Data:</span> You retain all ownership rights to your data (lead, CRM, etc.), but grant us a worldwide, royalty-free license to host, store, and use it solely to provide the Service to you.
                </li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">5. Disclaimer and Limitation of Liability</h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-800">
                <li>
                    <span className="font-semibold">"AS IS" Service:</span> The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind (express or implied).
                </li>
                <li>
                    <span className="font-semibold">Limitation of Liability:</span> Dakia.ai will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenues, or data, resulting from your use of the Service.
                </li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">6. Termination</h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-800">
                <li>
                    <span className="font-semibold">Termination by You:</span> You may stop using the Service at any time through your account settings or by contacting support.
                </li>
                <li>
                    <span className="font-semibold">Termination by Us:</span> We reserve the right to suspend or terminate your account at our sole discretion, without notice, for reasons including a breach of these Terms or conduct harmful to the Service or other users.
                </li>
                <li>
                    <span className="font-semibold">Effect:</span> Upon termination, your right to use the Service immediately ceases, and we may, at our discretion, permanently delete Your Data.
                </li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">7. Governing Law and Dispute Resolution</h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-800">
                <li>
                    <span className="font-semibold">Governing Law:</span> These Terms are governed by the laws of Pakistan.
                </li>
                <li>
                    <span className="font-semibold">Dispute Resolution:</span> Any dispute will be resolved through binding arbitration conducted in Islamabad, Pakistan. Each party will be responsible for its own arbitration fees.
                </li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="inline-block px-3 py-1 bg-brand-500 text-black font-semibold rounded-full">8. Modifications</h2>
            <p className="mt-4 text-gray-800">
                We may revise these Terms from time to time. We will notify you of any material changes by posting the new Terms on our website or by sending you an email. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
            </p>
        </section>

        <footer className="mt-16 border-t pt-6 text-center text-gray-600">
            <p>
                Questions? Email{' '}
                <a href="mailto:support@dakia.ai" className="text-primary font-medium">
                    support@dakia.ai
                </a>
            </p>
        </footer>
    </div>
);

export default TermsAndConditions;