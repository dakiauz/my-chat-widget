import { IRootState } from '@/app/store';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { Copy } from 'lucide-react';
import backendApiAddress from '../../shared/config/address';

const ChatWidgetScriptPage = () => {
    const companyId = useSelector((state: IRootState) => state.auth.user?.company_id);

    const [copied, setCopied] = useState(false);

    const scriptCode = `<script
  src="https://cdn.jsdelivr.net/gh/dakiauz/my-chat-widget/widget.iife.js"
  data-client-id="${companyId}"
  data-primary-color="#343434"
  data-secondary-color="#00ff00"
  data-api-base-url="${backendApiAddress.replace(/\/api$/, '')}"
></script>`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(scriptCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="">
            <div className="">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Live Chat Widget Integration</h1>
                    <p className="text-gray-500 mt-2">
                        Add this script inside your website’s <code>&lt;body&gt;</code> tag to enable the chat widget.
                    </p>
                </div>

                {/* Script Box */}
                <div className="relative group">
                    <pre className="bg-gray-900 text-green-400 font-mono text-sm p-5 rounded-xl overflow-x-auto shadow-inner">{scriptCode}</pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-all shadow-md"
                    >
                        <Copy size={16} />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidgetScriptPage;
