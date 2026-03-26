import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import FormInput from '../../shared/components/forms/FormInput';
import FormTextArea from '../../shared/components/forms/FormTextArea';
import { IRootState } from '../../store';
import { Trash2 } from 'lucide-react';

// Helper Component for Extraction/Injection
const QuickPromptSection = ({ fullText, onUpdate, title, startMarker, endMarker, placeholder, rows = 5, description }: any) => {
    if (!fullText) return null;

    const startIndex = fullText.indexOf(startMarker);

    // Safety: If start marker not found, hide this section
    if (startIndex === -1) return null;

    // Find end marker AFTER the start marker
    const endIndex = endMarker ? fullText.indexOf(endMarker, startIndex + startMarker.length) : -1;

    const contentStart = startIndex + startMarker.length;
    const contentEnd = endIndex !== -1 ? endIndex : fullText.length;

    const before = fullText.substring(0, contentStart);
    const content = fullText.substring(contentStart, contentEnd);
    const after = fullText.substring(contentEnd);

    const handleChange = (e: any) => {
        onUpdate(before + e.target.value + after);
    };

    return (
        <div className="mt-4 p-4 bg-blue-50/30 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
                <h5 className="font-bold text-gray-700 text-sm">{title}</h5>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">Quick Edit</span>
            </div>
            {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
            <FormTextArea
                value={content}
                onChange={handleChange}
                label=""
                placeholder={placeholder}
                rows={rows}
                className="font-mono text-sm bg-white"
                id={`quick-edit-${title.replace(/\s+/g, '-').toLowerCase()}`}
            />
        </div>
    );
};

const Onboarding = () => {
    const navigate = useNavigate();
    const user = useSelector((state: IRootState) => state.auth.user);
    const token = useSelector((state: IRootState) => state.auth.token);
    const [loading, setLoading] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [visiblePrompts, setVisiblePrompts] = useState({ chat_rag: false, analyze_lead: false, missed_call_chat: false, missed_call_analyze: false });
    const [promptSaving, setPromptSaving] = useState({ chat_rag: false, analyze_lead: false, missed_call_chat: false, missed_call_analyze: false });
    const [currentStep, setCurrentStep] = useState<number>(() => {
        // Initialize from session storage if a backup exists (from a refresh)
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('onboarding_backup');
            return saved ? parseInt(saved, 10) : 0;
        }
        return 0;
    });

    // Handle Persistent Step Logic (Refresh vs Navigation)
    useEffect(() => {
        // 1. Clear the backup immediately after mount.
        // This ensures that if the user navigates away via SPA router (which doesn't trigger beforeunload),
        // the storage is empty, so next time they visit, it starts at 0.
        sessionStorage.removeItem('onboarding_backup');

        // 2. Add listener to save state ONLY when the actual page is refreshing/closing
        const handleBeforeUnload = () => {
            sessionStorage.setItem('onboarding_backup', currentStep.toString());
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentStep]);

    // Live Review State
    const [activeAgent, setActiveAgent] = useState<'website' | 'missed_call'>('website');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatHistory]);

    useEffect(() => {
        const fetchHistory = async () => {
            // Construct deterministic session ID based on company ID if available
            let consistentSessionId = '';
            if (user?.company_id) {
                consistentSessionId = `demo-${activeAgent}-${user.company_id}`;
                setSessionId(consistentSessionId);
            }

            if (currentStep === 3) {
                // Clear state immediately to avoid bleeding
                // setChatHistory([]);
                setAnalysisResult(null);
                setChatLoading(true);

                try {
                    console.log(`Fetching history for: ${activeAgent} (Company: ${user?.company_id})`);
                    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/demo/history`, {
                        params: { type: activeAgent },
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    console.log("History Response (Raw):", res.data);

                    const responseData = res.data.data || res.data;
                    if (responseData) {
                        const { history, session_id, analysis } = responseData;

                        // Prefer backend ID if returned, otherwise keep our local one
                        if (session_id) {
                            setSessionId(session_id);
                        } else if (!consistentSessionId) {
                            const newId = Math.random().toString(36).substring(7);
                            setSessionId(newId);
                        }

                        // Restore Analysis
                        setAnalysisResult(analysis);

                        // Restore History
                        if (history) {
                            // Safety: specific check if it's object-like array vs real array
                            const historyArray = Array.isArray(history) ? history : Object.values(history) || [];
                            setChatHistory([...historyArray]);
                        } else {
                            // Default Welcome IF history is truly empty
                            const welcome = activeAgent === 'website'
                                ? "Hello! Welcome to Dakia.ai. How can I help you today?"
                                : "Hi, I saw you called earlier. How can we help?";
                            setChatHistory([{ role: 'assistant', content: welcome }]);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load history", err);
                    // Use consistent ID if available
                    if (consistentSessionId) {
                        setSessionId(consistentSessionId);
                    } else {
                        setSessionId(Math.random().toString(36).substring(7));
                    }

                    const welcome = activeAgent === 'website'
                        ? "Hello! Welcome to Dakia.ai. How can I help you today?"
                        : "Hi, I saw you called earlier. How can we help?";
                    setChatHistory([{ role: 'assistant', content: welcome }]);
                } finally {
                    setChatLoading(false);
                }
            }
        };

        fetchHistory();
    }, [currentStep, activeAgent, user?.company_id]);


    const handleLiveMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const msg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
        setChatLoading(true);

        // Ensure we always have a valid session ID
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            currentSessionId = Math.random().toString(36).substring(7);
            setSessionId(currentSessionId);
            console.warn("Session ID was missing, generated new one:", currentSessionId);
        }

        try {
            const endpoint = activeAgent === 'website'
                ? `${import.meta.env.VITE_API_BASE_URL}/demo/chat/send`
                : `${import.meta.env.VITE_API_BASE_URL}/demo/missed/send`;

            const res = await axios.post(endpoint, {
                message: msg,
                session_id: currentSessionId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data) { // ApiResponseHelpers might mix keys
                const reply = res.data.reply || res.data.data?.reply;
                const analysis = res.data.analysis || res.data.data?.analysis;

                if (reply) {
                    setChatHistory(prev => [...prev, { role: 'assistant', content: reply }]);
                }
                if (analysis) {
                    setAnalysisResult(analysis);
                }
            }
        } catch (err) {
            console.error("Live Demo Error:", err);
            setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to the brain right now." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/demo/history`, {
                data: { session_id: sessionId, type: activeAgent },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setChatHistory([]);
            showNotification({
                title: 'Success',
                message: 'Chat history cleared',
                color: 'green'
            });
        } catch (error) {
            console.error(error);
            showNotification({
                title: 'Error',
                message: 'Failed to clear history',
                color: 'red'
            });
        }
    };

    // Inputs
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [scrapedJsonPath, setScrapedJsonPath] = useState<string | null>(null);

    const EMPTY_PROFILE = {
        "Business Identity": {
            "Type": "",
            "Industry": "",
            "Summary": "",
            "Target Customer": "",
            "Unique Value Proposition": ""
        },
        "Services / Products": {
            "Core Products": "",
            "Core Services": "",
            "Service Areas": ""
        },
        "Appointments / Booking": {
            "Appointment Types": "",
            "Booking Steps": "",
            "Booking Channels": ""
        },
        "Contact Information": {
            "Phone": "",
            "Email": "",
            "Address": "",
            "Social Links": ""
        },
        "Business Hours & Pricing": {
            "Business Hours": "",
            "Pricing Summary": ""
        },
        "Sales Signals & Policies": {
            "Key Benefits": "",
            "Calls to Action": "",
            "Testimonials": "",
            "Key Policies": ""
        }
    };

    const [scrapedData, setScrapedData] = useState<any>(EMPTY_PROFILE);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const companyId = user?.company_id || user?.id || 1;

    // --- Prompts Logic ---
    const [prompts, setPrompts] = useState<{ analyze_lead: string, chat_rag: string, missed_call_chat: string, missed_call_analyze: string }>({ analyze_lead: '', chat_rag: '', missed_call_chat: '', missed_call_analyze: '' });


    const fetchPrompts = async () => {
        if (!token) return;
        try {
            console.log("Fetching prompts from API...");
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/company/prompts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("API Response Data:", res.data);

            if (res.data) {
                // Fix: Check if res.data IS the array, or if it's wrapped in res.data.data
                let pData = Array.isArray(res.data) ? res.data : res.data.data;

                // Fallback for object-style response (keyBy)
                if (pData && !Array.isArray(pData)) {
                    pData = Object.values(pData);
                }

                const newPrompts: any = { analyze_lead: '', chat_rag: '', missed_call_chat: '', missed_call_analyze: '' };
                if (Array.isArray(pData)) {
                    pData.forEach((p: any) => {
                        console.log(`Frontend Mapping ${p.key}: Length=${p.prompt_text?.length || 0}`);
                        if (p.key === 'analyze_lead') newPrompts.analyze_lead = p.prompt_text;
                        if (p.key === 'chat_rag') newPrompts.chat_rag = p.prompt_text;
                        if (p.key === 'missed_call_chat') newPrompts.missed_call_chat = p.prompt_text;
                        if (p.key === 'missed_call_analyze') newPrompts.missed_call_analyze = p.prompt_text;
                    });

                    setPrompts(newPrompts);
                    showNotification({
                        title: 'Sync Complete',
                        message: 'Displayed prompts updated from server.',
                        color: 'blue'
                    });
                } else {
                    console.warn("API Response was valid but pData extraction failed:", res.data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch prompts", err);
            showNotification({
                title: 'Error',
                message: 'Failed to sync prompts.',
                color: 'red'
            });
        }
    };

    useEffect(() => {
        fetchPrompts();
        fetchCompanyData();
    }, [token]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const fetchCompanyData = async () => {
        try {
            // Assume 8001 for FastAPI service based on context
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/ai/get-company-data/${companyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data && res.data.success && res.data.business_data && Object.keys(res.data.business_data).length > 0) {
                console.log("Fetched company data:", res.data.business_data);

                // Deep merge with schema to ensure structure
                const mergedData: any = JSON.parse(JSON.stringify(EMPTY_PROFILE));
                const backendData = res.data.business_data;

                Object.keys(backendData).forEach(section => {
                    if (mergedData[section]) {
                        if (typeof backendData[section] === 'object') {
                            // Clean "I do not know" values
                            const cleanFields = { ...backendData[section] };
                            Object.keys(cleanFields).forEach(k => {
                                const val = cleanFields[k];
                                if (typeof val === 'string' && val.toLowerCase().includes("i do not know")) {
                                    cleanFields[k] = "";
                                }
                            });
                            mergedData[section] = { ...mergedData[section], ...cleanFields };
                        }
                    } else {
                        mergedData[section] = backendData[section];
                    }
                });
                setScrapedData(mergedData);
            }
        } catch (error) {
            console.error("Failed to fetch existing company data:", error);
            // On error, keep empty profile
        }
    };

    const handlePromptSave = async (key: string) => {
        setPromptSaving(prev => ({ ...prev, [key]: true }));
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/company/prompts`, {
                key,
                prompt_text: (prompts as any)[key]
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification({
                title: 'Saved',
                message: 'AI Prompt updated successfully',
                color: 'green'
            });
        } catch (err) {
            showNotification({
                title: 'Error',
                message: 'Failed to update prompt',
                color: 'red'
            });
        } finally {
            setPromptSaving(prev => ({ ...prev, [key]: false }));
        }
    };

    const handlePromptReset = async (key: string) => {
        if (!window.confirm("Are you sure you want to reset to the default system prompt? The page will refresh.")) return;

        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/company/prompts`, {
                headers: { 'Authorization': `Bearer ${token}` },
                data: { key }
            });

            // Check for 200 OK status instead of relying on 'success' property structure
            if (res.status === 200) {
                showNotification({
                    title: 'Resetting...',
                    message: 'Reverting to default system prompt',
                    color: 'blue'
                });

                // Force reload to trigger backend auto-seeding
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (err) {
            showNotification({
                title: 'Error',
                message: 'Failed to reset prompt',
                color: 'red'
            });
        }
    };


    const handleUnifiedExtract = async () => {
        if (!websiteUrl && !selectedFile) {
            showNotification({
                title: 'Action Required',
                message: 'Please enter a URL or upload a PDF first.',
                color: 'orange'
            });
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('company_id', String(companyId));

            if (websiteUrl) {
                formData.append('url', websiteUrl);
            }

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ai/extract-from-source`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setScrapedJsonPath(response.data.scraped_json_path);

                const rawData = response.data.business_data;
                const newData = { ...scrapedData };

                const structure: any = {
                    "Business Identity": ["Type", "Industry", "Summary", "Target Customer", "Unique Value Proposition"],
                    "Services / Products": ["Core Products", "Core Services", "Service Areas"],
                    "Appointments / Booking": ["Appointment Types", "Booking Steps", "Booking Channels"],
                    "Contact Information": ["Phone", "Email", "Address", "Social Links"],
                    "Business Hours & Pricing": ["Business Hours", "Pricing Summary"],
                    "Sales Signals & Policies": ["Key Benefits", "Calls to Action", "Testimonials", "Key Policies"]
                };

                Object.keys(structure).forEach(header => {
                    structure[header].forEach((field: string) => {
                        if (rawData[field]) {
                            newData[header][field] = rawData[field];
                        }
                    });
                });

                setScrapedData(newData);
                showNotification({
                    title: 'Success',
                    message: 'Business data extracted successfully!',
                    color: 'green'
                });
            } else {
                showNotification({
                    title: 'Extraction Issue',
                    message: response.data.message || 'Could not extract data.',
                    color: 'orange'
                });
            }

        } catch (error) {
            console.error('Unified extraction error:', error);
            showNotification({
                title: 'Extraction Failed',
                message: 'Could not retrieve data from the provided sources.',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const validateFields = () => {
        // Validate Mandatory Fields
        const missingFields: string[] = [];
        const newErrors: Record<string, boolean> = {};
        let hasError = false;

        if (scrapedData) {
            Object.entries(scrapedData).forEach(([section, fields]: [string, any]) => {
                if (typeof fields === 'object') {
                    Object.entries(fields).forEach(([key, value]: [string, any]) => {
                        // Skip optional fields
                        if (key === 'Testimonials' || key === 'Key Policies') return;

                        // Check for empty or "I do not know"
                        if (!value || (typeof value === 'string' && !value.trim()) || value === "I do not know") {
                            missingFields.push(key);
                            newErrors[`${section}-${key}`] = true;
                            hasError = true;
                        }
                    });
                }
            });
        }

        setErrors(newErrors);

        if (hasError) {
            showNotification({
                title: 'Validation Error',
                message: 'Please fill in the highlighted mandatory fields.',
                color: 'red'
            });
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateFields()) return;

        const jsonPathToUse = scrapedJsonPath || "manual_entry_placeholder";

        try {
            setIsSaving(true);
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ai/index-to-pinecone`, {
                company_id: companyId,
                scraped_json_path: jsonPathToUse,
                edited_business_data: scrapedData
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                // Activate AI in Backend
                try {
                    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/company/complete-onboarding`, {}, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (activationError) {
                    console.error("Backend activation failed", activationError);
                    // We shouldn't block success just because of this, but it's important.
                }

                showNotification({
                    title: 'Setup Complete',
                    message: 'Your business profile has been saved to the AI knowledge base!',
                    color: 'green'
                });
                setCurrentStep(2);
            } else {
                throw new Error(response.data.message || 'Failed to index data');
            }
        } catch (error: any) {
            console.error('Save error:', error);
            showNotification({
                title: 'Save Failed',
                message: error.response?.data?.detail || 'Could not save to vector database.',
                color: 'red'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (section: string, field: string, value: string) => {
        setScrapedData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 px-4 font-inter">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                    <div className="bg-white p-10 text-center border-b border-gray-100">
                        <h2 className="text-3xl font-extrabold font-montserrat text-gray-900 mb-4">Let's Train Your AI Agent</h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
                            Connect your data sources so our AI can learn about your business and start handling tasks immediately.
                        </p>

                        {currentStep === 0 ? (
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="bg-purple-600 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:bg-purple-700 transition transform hover:scale-105 text-lg"
                            >
                                Let's Start
                            </button>
                        ) : (
                            /* STEPPER */
                            <div className="flex justify-center items-center w-full max-w-3xl mx-auto mt-8">
                                {/* Step 1 */}
                                <div className="flex flex-col items-center relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${currentStep >= 1 ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                        {currentStep > 1 ? '✓' : '1'}
                                    </div>
                                    <span className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap ${currentStep >= 1 ? 'text-purple-700' : 'text-gray-400'}`}>Data Source</span>
                                </div>

                                {/* Connector */}
                                <div className={`h-1 flex-1 mx-4 rounded ${currentStep >= 2 ? 'bg-purple-200' : 'bg-gray-100'}`}></div>

                                {/* Step 2 */}
                                <div className="flex flex-col items-center relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${currentStep >= 2 ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                        {currentStep > 2 ? '✓' : '2'}
                                    </div>
                                    <span className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap ${currentStep >= 2 ? 'text-purple-700' : 'text-gray-400'}`}>Business Identity</span>
                                </div>

                                {/* Connector */}
                                <div className={`h-1 flex-1 mx-4 rounded ${currentStep >= 3 ? 'bg-purple-200' : 'bg-gray-100'}`}></div>

                                {/* Step 3 */}
                                <div className="flex flex-col items-center relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${currentStep >= 3 ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                        3
                                    </div>
                                    <span className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap ${currentStep >= 3 ? 'text-purple-700' : 'text-gray-400'}`}>Agent Preview</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {currentStep === 1 && (
                        <div className="p-8 border-b border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Website Scrape Section */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Option 1: Scrape Website</h3>
                                    <div className="flex flex-col gap-4">
                                        <FormInput
                                            id="website-url"
                                            type="url"
                                            placeholder="https://example.com"
                                            value={websiteUrl}
                                            onChange={(e) => setWebsiteUrl((e.target as HTMLInputElement).value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* PDF Upload Section */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Option 2: Upload PDF</h3>
                                    <div className="flex flex-col gap-4">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                            className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Retrieve Button Section */}
                {currentStep === 1 && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleUnifiedExtract}
                            disabled={loading || (!websiteUrl && !selectedFile)}
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Let AI Retrieve your data
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>


            <div className="p-8 space-y-12">
                {loading && currentStep === 1 && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500 font-medium">AI is analyzing your data...</p>
                    </div>
                )}

                {!loading && currentStep === 1 && Object.entries(scrapedData).map(([section, fields]: [string, any]) => (
                    <section key={section} className="relative">
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-xl font-bold text-blue-900 bg-blue-50 px-4 py-1 rounded-lg border border-blue-100">
                                {section}
                            </h3>
                            <div className="h-[1px] flex-grow bg-blue-50"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {Object.entries(fields).map(([label, value]: [string, any]) => {
                                const fieldId = `${section}-${label}`;
                                const isError = errors[fieldId];
                                const baseClasses = "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-all duration-200";
                                const errorClasses = "!border-red-500 !ring-1 !ring-red-500";

                                return (
                                    <div key={label} className={label === 'Summary' || label === 'Testimonials' || label === 'Unique Value Proposition' ? 'md:col-span-2' : ''}>
                                        {label === 'Summary' || label === 'Testimonials' || label.includes('Solution') || (typeof value === 'string' && value.length > 100) ? (
                                            <FormTextArea
                                                label={label}
                                                id={fieldId}
                                                rows={3}
                                                value={value}
                                                onChange={(e: any) => {
                                                    updateField(section, label, (e.target as any).value);
                                                    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: false }));
                                                }}
                                                placeholder={`Enter ${label}`}
                                                className={`${baseClasses} ${isError ? errorClasses : ''}`}
                                            />
                                        ) : (
                                            <FormInput
                                                label={label}
                                                id={fieldId}
                                                type="text"
                                                className={`${baseClasses} ${isError ? errorClasses : ''}`}
                                                value={value}
                                                onChange={(e: any) => {
                                                    updateField(section, label, (e.target as any).value);
                                                    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: false }));
                                                }}
                                                placeholder={`Enter ${label}`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                ))}

                {/* AI Prompts Section */}
                {currentStep === 2 && (
                    <div className="animate-fadeIn">
                        <section className="relative mt-8 pt-0 border-t-0 border-gray-200">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-xl font-bold text-purple-900 bg-purple-50 px-4 py-1 rounded-lg border border-purple-100">
                                    AI Personality & Prompts
                                </h3>
                                <div className="h-[1px] flex-grow bg-purple-50"></div>
                            </div>

                            <div className="grid grid-cols-1 gap-12">
                                {/* Chat Assistant Prompt */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">


                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-bold text-gray-800">Chat Assistant Prompt (prompts.yaml)</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setVisiblePrompts(prev => ({ ...prev, chat_rag: !prev.chat_rag }))}
                                                className="text-white bg-blue-500 hover:bg-blue-600 text-sm font-semibold px-3 py-2 rounded-lg"
                                            >
                                                {visiblePrompts.chat_rag ? 'Hide Full Prompt' : 'Display My Current Prompt'}
                                            </button>
                                            <button
                                                onClick={() => handlePromptReset('chat_rag')}
                                                className="text-gray-500 hover:text-red-500 text-sm font-semibold px-3 py-2"
                                            >
                                                Reset to Default
                                            </button>
                                            <button
                                                onClick={() => handlePromptSave('chat_rag')}
                                                disabled={promptSaving.chat_rag}
                                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {promptSaving.chat_rag ? 'Saving...' : 'Save Chat Prompt'}
                                            </button>
                                        </div>
                                    </div>

                                    {visiblePrompts.chat_rag && (
                                        <>
                                            <p className="text-sm text-gray-500 mb-2">Instructions for the bot handling live chat and questions.</p>
                                            <FormTextArea
                                                label=""
                                                variant="filled"
                                                id="prompt-chat-rag"
                                                rows={15}
                                                value={prompts.chat_rag}
                                                onChange={(e: any) => setPrompts(prev => ({ ...prev, chat_rag: e.target.value }))}
                                                placeholder="Enter system instructions..."
                                                className="font-mono text-sm"
                                            />
                                        </>

                                    )}

                                    {/* Quick Edits for Chat RAG */}
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <QuickPromptSection
                                            fullText={prompts.chat_rag}
                                            onUpdate={(newText: string) => setPrompts(prev => ({ ...prev, chat_rag: newText }))}
                                            title="Appointment Booking Sequence"
                                            startMarker="APPOINTMENT BOOKING & DATA CAPTURE (THE SEQUENCE)"
                                            endMarker="TIERED QUALIFICATION"
                                            description="Modify how the bot asks for appointments and captures data."
                                            rows={8}
                                        />
                                    </div>
                                </div>

                                {/* Lead Analysis Prompt */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                                    {/* Quick Edits for Lead Analysis - MOVED TO TOP */}


                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-bold text-gray-800">Lead Analysis Prompt (analyze.yaml)</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setVisiblePrompts(prev => ({ ...prev, analyze_lead: !prev.analyze_lead }))}
                                                className="text-white bg-blue-500 hover:bg-blue-600 text-sm font-semibold px-3 py-2 rounded-lg"
                                            >
                                                {visiblePrompts.analyze_lead ? 'Hide Full Prompt' : 'Display My Current Prompt'}
                                            </button>
                                            <button
                                                onClick={() => handlePromptReset('analyze_lead')}
                                                className="text-gray-500 hover:text-red-500 text-sm font-semibold px-3 py-2"
                                            >
                                                Reset to Default
                                            </button>
                                            <button
                                                onClick={() => handlePromptSave('analyze_lead')}
                                                disabled={promptSaving.analyze_lead}
                                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {promptSaving.analyze_lead ? 'Saving...' : 'Save Analysis Prompt'}
                                            </button>
                                        </div>
                                    </div>

                                    {visiblePrompts.analyze_lead && (
                                        <>
                                            <p className="text-sm text-gray-500 mb-2">Instructions for the AI analyzing chat history to qualify leads.</p>
                                            <FormTextArea
                                                label=""
                                                variant="filled"
                                                id="prompt-analyze-lead"
                                                rows={15}
                                                value={prompts.analyze_lead}
                                                onChange={(e: any) => setPrompts(prev => ({ ...prev, analyze_lead: e.target.value }))}
                                                placeholder="Enter analysis instructions..."
                                                className="font-mono text-sm"
                                            />
                                        </>

                                    )}

                                    {/* Quick Edits for Lead Analysis */}
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <QuickPromptSection
                                            fullText={prompts.analyze_lead}
                                            onUpdate={(newText: string) => setPrompts(prev => ({ ...prev, analyze_lead: newText }))}
                                            title="Lead Status Definitions"
                                            startMarker="**Lead Status Definitions**:"
                                            endMarker="**Lead Classification Definitions (Temperature)**:"
                                            description="Define New, Qualified, Unqualified statuses."
                                            rows={10}
                                        />
                                        <QuickPromptSection
                                            fullText={prompts.analyze_lead}
                                            onUpdate={(newText: string) => setPrompts(prev => ({ ...prev, analyze_lead: newText }))}
                                            title="Lead Classification (Temp.)"
                                            startMarker="**Lead Classification Definitions (Temperature)**:"
                                            endMarker="**Response Format**:"
                                            description="Define Hot, Warm, Cold lead criteria."
                                            rows={10}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section >

                        {/* Missed Call Prompts Section */}
                        <section className="relative mt-12 pt-8 border-t border-gray-200">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-xl font-bold text-red-900 bg-red-50 px-4 py-1 rounded-lg border border-red-100">
                                    Missed Call AI Agent
                                </h3>
                                <div className="h-[1px] flex-grow bg-red-50"></div>
                            </div>

                            <div className="grid grid-cols-1 gap-12">
                                {/* Missed Call Chat Prompt */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-bold text-gray-800">Missed Call Agent Prompt (missed_prompts.yaml)</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setVisiblePrompts(prev => ({ ...prev, missed_call_chat: !prev.missed_call_chat }))}
                                                className="text-white bg-blue-500 hover:bg-blue-600 text-sm font-semibold px-3 py-2 rounded-lg"
                                            >
                                                {visiblePrompts.missed_call_chat ? 'Hide Full Prompt' : 'Display My Current Prompt'}
                                            </button>
                                            <button
                                                onClick={() => handlePromptReset('missed_call_chat')}
                                                className="text-gray-500 hover:text-red-500 text-sm font-semibold px-3 py-2"
                                            >
                                                Reset to Default
                                            </button>
                                            <button
                                                onClick={() => handlePromptSave('missed_call_chat')}
                                                disabled={promptSaving.missed_call_chat}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {promptSaving.missed_call_chat ? 'Saving...' : 'Save Missed Call Prompt'}
                                            </button>
                                        </div>
                                    </div>

                                    {visiblePrompts.missed_call_chat && (
                                        <>
                                            <p className="text-sm text-gray-500 mb-2">Instructions for the bot handling missed call SMS conversations.</p>
                                            <FormTextArea
                                                label=""
                                                variant="filled"
                                                id="prompt-missed-call-chat"
                                                rows={15}
                                                value={prompts.missed_call_chat}
                                                onChange={(e: any) => setPrompts(prev => ({ ...prev, missed_call_chat: e.target.value }))}
                                                placeholder="Enter instructions..."
                                                className="font-mono text-sm"
                                            />
                                        </>

                                    )}

                                    {/* Quick Edits for Missed Call Chat */}
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <QuickPromptSection
                                            fullText={prompts.missed_call_chat}
                                            onUpdate={(newText: string) => setPrompts(prev => ({ ...prev, missed_call_chat: newText }))}
                                            title="Appointment Booking Sequence"
                                            startMarker="APPOINTMENT BOOKING & DATA CAPTURE (THE SEQUENCE)"
                                            endMarker="TIERED QUALIFICATION"
                                            description="Modify how the bot asks for appointments and captures data."
                                            rows={8}
                                        />
                                    </div>
                                </div>

                                {/* Missed Call Analysis Prompt */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-bold text-gray-800">Missed Call Analysis Prompt (missed_analyze.yaml)</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setVisiblePrompts(prev => ({ ...prev, missed_call_analyze: !prev.missed_call_analyze }))}
                                                className="text-white bg-blue-500 hover:bg-blue-600 text-sm font-semibold px-3 py-2 rounded-lg"
                                            >
                                                {visiblePrompts.missed_call_analyze ? 'Hide Full Prompt' : 'Display My Current Prompt'}
                                            </button>
                                            <button
                                                onClick={() => handlePromptReset('missed_call_analyze')}
                                                className="text-gray-500 hover:text-red-500 text-sm font-semibold px-3 py-2"
                                            >
                                                Reset to Default
                                            </button>
                                            <button
                                                onClick={() => handlePromptSave('missed_call_analyze')}
                                                disabled={promptSaving.missed_call_analyze}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {promptSaving.missed_call_analyze ? 'Saving...' : 'Save Missed Call Analysis'}
                                            </button>
                                        </div>
                                    </div>

                                    {visiblePrompts.missed_call_analyze && (
                                        <>
                                            <p className="text-sm text-gray-500 mb-2">Instructions for the AI analyzing missed call chat history.</p>
                                            <FormTextArea
                                                label=""
                                                variant="filled"
                                                id="prompt-missed-call-analyze"
                                                rows={15}
                                                value={prompts.missed_call_analyze}
                                                onChange={(e: any) => setPrompts(prev => ({ ...prev, missed_call_analyze: e.target.value }))}
                                                placeholder="Enter analysis instructions..."
                                                className="font-mono text-sm"
                                            />
                                        </>
                                    )}

                                    {/* Quick Edits for Missed Call Analysis */}
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <QuickPromptSection
                                            fullText={prompts.missed_call_analyze}
                                            onUpdate={(newText: string) => setPrompts(prev => ({ ...prev, missed_call_analyze: newText }))}
                                            title="Lead Status Definitions"
                                            startMarker="**Lead Status Definitions**:"
                                            endMarker="**Lead Classification Definitions (Temperature)**:"
                                            description="Define New, Qualified, Unqualified statuses."
                                            rows={10}
                                        />
                                        <QuickPromptSection
                                            fullText={prompts.missed_call_analyze}
                                            onUpdate={(newText: string) => setPrompts(prev => ({ ...prev, missed_call_analyze: newText }))}
                                            title="Lead Classification (Temp.)"
                                            startMarker="**Lead Classification Definitions (Temperature)**:"
                                            endMarker="**Response Format**:"
                                            description="Define Hot, Warm, Cold lead criteria."
                                            rows={10}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section >
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="pt-10 border-t border-gray-100 mt-12 flex justify-between items-center">
                        <div className="text-sm text-gray-500 italic max-w-md">
                            Note: Your AI Assistant uses this information to answer customer queries accurately.
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    if (validateFields()) setCurrentStep(2);
                                }}
                                className="text-gray-500 hover:text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                            >
                                Skip for now
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'} text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-200 hover:-translate-y-1 transition-all duration-300 text-lg flex items-center gap-2`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Save Profile & Proceed to Step 2
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2 Footer */}
                {currentStep === 2 && (
                    <div className="mt-12 flex justify-center pb-20">
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="bg-purple-600 text-white font-bold py-4 px-12 rounded-full shadow-lg hover:bg-purple-700 transition transform hover:scale-105 flex items-center gap-2"
                        >
                            Proceed to Live Demo
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}

                {/* Step 3 Content */}
                {currentStep === 3 && (
                    <div className="flex flex-row h-[800px] mt-8 bg-white text-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                        {/* Left Sidebar - Agent Selector */}
                        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
                            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 pl-2">Select Agent</h4>
                            <button
                                onClick={() => setActiveAgent('website')}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeAgent === 'website' ? 'bg-purple-100 border border-purple-200 text-purple-900 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm border border-transparent'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'website' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-400'}`}></div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">Website Chatbot</div>
                                    <div className={`text-xs ${activeAgent === 'website' ? 'text-purple-700' : 'text-gray-400'}`}>{activeAgent === 'website' ? 'Active' : 'Idle'}</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveAgent('missed_call')}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeAgent === 'missed_call' ? 'bg-purple-100 border border-purple-200 text-purple-900 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm border border-transparent'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'missed_call' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-400'}`}></div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">Missed Call AI</div>
                                    <div className={`text-xs ${activeAgent === 'missed_call' ? 'text-purple-700' : 'text-gray-400'}`}>{activeAgent === 'missed_call' ? 'Active' : 'Idle'}</div>
                                </div>
                            </button>
                        </div>

                        {/* Middle - Chat Area */}
                        <div className="flex-1 flex flex-col bg-white relative">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2.5 w-2.5 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    <span className="font-bold text-gray-800 text-sm">Live Preview</span>
                                    <span className="text-gray-400 text-xs ml-2 uppercase tracking-wide px-2 py-0.5 bg-gray-100 rounded-md">
                                        {activeAgent === 'website' ? 'Website Widget' : 'SMS Flow'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleClearChat}
                                    title="All conversation done by the bot will be deleted"
                                    className="p-2 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-md transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold mr-3 mt-1 text-white shadow-md">AI</div>
                                        )}
                                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold mr-3 mt-1 text-white shadow-md">AI</div>
                                        <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100 p-4 flex gap-1 items-center shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLiveMessage()}
                                        placeholder="Type your message..."
                                        className="w-full bg-gray-50 text-gray-900 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 border border-gray-200 placeholder-gray-400 transition-all shadow-sm"
                                    />
                                    <button
                                        onClick={handleLiveMessage}
                                        disabled={chatLoading}
                                        className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center group"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right - Analysis Panel */}
                        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-extrabold text-gray-800 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                    Brain Activity
                                </h4>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 tracking-wide animate-pulse">LIVE</span>
                            </div>

                            {/* Conversation Summary */}
                            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider flex justify-between">
                                    Conversation Summary
                                </div>
                                <div className="text-sm font-medium text-gray-700 leading-relaxed">
                                    {analysisResult?.summary || 'Waiting for conversation to start...'}
                                </div>
                            </div>

                            {/* Lead Status */}
                            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">Lifecycle Stage</div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold w-full text-center border ${(analysisResult?.status === 'Hot' || analysisResult?.status === 'Qualified' || analysisResult?.status === 'Appointment Scheduled')
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-gray-50 text-gray-600 border-gray-100'
                                        }`}>
                                        {analysisResult?.status || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            {/* Temperature Meter */}
                            <div className="mb-6 p-5 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-3 tracking-wider z-10 relative"> Lead Temp</div>

                                <div className="flex items-end justify-between mb-2 relative z-10">
                                    <span className={`text-2xl font-black ${(analysisResult?.lead_info?.classification === 'Hot' || analysisResult?.status === 'Hot') ? 'text-red-500' :
                                        (analysisResult?.lead_info?.classification === 'Warm' || analysisResult?.status === 'Warm') ? 'text-orange-500' :
                                            'text-blue-500'
                                        }`}>
                                        {analysisResult?.lead_info?.classification || analysisResult?.temperature || 'Cold'}
                                    </span>
                                    <span className="text-3xl filter drop-shadow-sm">
                                        {(analysisResult?.lead_info?.classification === 'Hot' || analysisResult?.status === 'Hot') ? '🔥' :
                                            (analysisResult?.lead_info?.classification === 'Warm' || analysisResult?.status === 'Warm') ? '🌤️' :
                                                '🧊'}
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${(analysisResult?.lead_info?.classification === 'Hot' || analysisResult?.status === 'Hot') ? 'bg-gradient-to-r from-orange-400 to-red-500 w-full' :
                                        (analysisResult?.lead_info?.classification === 'Warm' || analysisResult?.status === 'Warm') ? 'bg-gradient-to-r from-yellow-400 to-orange-500 w-2/3' :
                                            'bg-blue-400 w-1/3'
                                        }`}></div>
                                </div>
                            </div>

                            {/* Extracted Data (lead_info) */}
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase mb-3 tracking-wider pl-1">Extracted Data</div>
                                <div className="space-y-2">
                                    {analysisResult?.lead_info ? (
                                        Object.entries(analysisResult.lead_info).map(([key, val]: [string, any]) => {
                                            if (!val || key === 'classification') return null; // Skip empty or classification (shown above)
                                            return (
                                                <div key={key} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="text-[10px] text-purple-600 font-bold uppercase mb-1 tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                                    <div className="text-sm text-gray-800 font-medium truncate">{String(val)}</div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            No entities detected yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default Onboarding;
