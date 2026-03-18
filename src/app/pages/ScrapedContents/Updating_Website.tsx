import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import FormInput from '../../shared/components/forms/FormInput';
import FormTextArea from '../../shared/components/forms/FormTextArea';
import { IRootState } from '../../store';
import backendApiAddress from '../../shared/config/address';

const Updating_Website = () => {
    const navigate = useNavigate();
    const user = useSelector((state: IRootState) => state.auth.user);
    const token = useSelector((state: IRootState) => state.auth.token);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [scrapedJsonPath, setScrapedJsonPath] = useState<string | null>(null);

    const [scrapedData, setScrapedData] = useState<any>({
        "Business Identity": {
            "Type": "Sales engagement tool",
            "Industry": "Technology / Software",
            "Summary": "Dakia.ai is a comprehensive sales engagement tool designed to streamline cold email outreach.",
            "Target Customer": "Agencies, recruiters, entrepreneurs",
            "Unique Value Proposition": "Dakia provides a one-stop solution for cold email needs."
        },
        "Services / Products": {
            "Core Products": "Email sending accounts, email warm-up system",
            "Core Services": "Cold email campaigns, unified inbox management",
            "Service Areas": "Global"
        },
        "Appointments / Booking": {
            "Appointment Types": "Demo Call",
            "Booking Steps": "Select time, enter details",
            "Booking Channels": "Website"
        },
        "Contact Information": {
            "Phone": "I do not know",
            "Email": "info@dakia.ai",
            "Address": "I do not know",
            "Social Links": "I do not know"
        },
        "Business Hours & Pricing": {
            "Business Hours": "24/7",
            "Pricing Summary": "Free 14-day trial"
        },
        "Sales Signals & Policies": {
            "Key Benefits": "Unlimited sending accounts",
            "Calls to Action": "Sign up for Free Trial",
            "Testimonials": "Great tool!",
            "Key Policies": "I do not know"
        }
    });

    useEffect(() => {
        const fetchScrapedData = async () => {
            const websiteUrl = user?.company?.website || localStorage.getItem('company_url');
            const companyId = user?.company_id || user?.id || 1;

            if (!websiteUrl) {
                setTimeout(() => setLoading(false), 1500);
                return;
            }

            try {
                setLoading(true);
                const scrapeRes = await axios.post(`${backendApiAddress}/ai/scrape`, {
                    url: websiteUrl,
                    company_id: companyId
                }, {
                    headers: { 'Authorization': `Bearer ${token}` } // Assuming token is available via selector like in Onboarding
                });

                if (scrapeRes.data.success) {
                    setScrapedJsonPath(scrapeRes.data.scraped_json_path);
                    const extractRes = await axios.post(`${backendApiAddress}/ai/extract-business-data`, {
                        scraped_json_path: scrapeRes.data.scraped_json_path,
                        company_id: companyId
                    }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (extractRes.data.success) {
                        const rawData = extractRes.data.business_data;

                        // Map the flat response to our grouped structure
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
                    }
                }
            } catch (error) {
                console.error('Scraping error:', error);
                showNotification({
                    title: 'Scraping Info',
                    message: 'Showing sample values. Extraction from live URL failed.',
                    color: 'blue'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchScrapedData();
    }, [user]);

    const handleSave = async () => {
        const companyId = user?.company_id || user?.id || 1;

        if (!scrapedJsonPath) {
            showNotification({
                title: 'Error',
                message: 'No scraped data found to save. Please refresh and try again.',
                color: 'red'
            });
            return;
        }

        try {
            setIsSaving(true);
            const response = await axios.post(`${backendApiAddress}/ai/index-to-pinecone`, {
                company_id: companyId,
                scraped_json_path: scrapedJsonPath,
                edited_business_data: scrapedData
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                showNotification({
                    title: 'Setup Complete',
                    message: 'Your business profile has been saved to the AI database!',
                    color: 'green'
                });
                navigate('/dashboard');
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
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-white">
                        <h2 className="text-3xl font-extrabold font-montserrat">Optimize Your Business Profile</h2>
                        <p className="mt-2 text-blue-100/80 text-lg">
                            We've scanned your website to populate your AI's knowledge base. Review and refine the details below.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-ping"></div>
                                </div>
                            </div>
                            <p className="mt-8 text-xl font-bold text-gray-800">Dakia AI is parsing your website...</p>
                            <p className="text-gray-500 mt-2">This creates a foundation for your automated sales bot.</p>
                        </div>
                    ) : (
                        <div className="p-8 space-y-12">
                            {Object.entries(scrapedData).map(([section, fields]: [string, any]) => (
                                <section key={section} className="relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h3 className="text-xl font-bold text-blue-900 bg-blue-50 px-4 py-1 rounded-lg border border-blue-100">
                                            {section}
                                        </h3>
                                        <div className="h-[1px] flex-grow bg-blue-50"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        {Object.entries(fields).map(([label, value]: [string, any]) => (
                                            <div key={label} className={label === 'Summary' || label === 'Testimonials' || label === 'Unique Value Proposition' ? 'md:col-span-2' : ''}>
                                                {label === 'Summary' || label === 'Testimonials' || label.includes('Solution') || value.length > 100 ? (
                                                    <FormTextArea
                                                        label={label}
                                                        variant="filled"
                                                        id={`${section}-${label}`}
                                                        rows={3}
                                                        value={value}
                                                        onChange={(e: any) => updateField(section, label, e.target.value)}
                                                        placeholder={`Enter ${label}`}
                                                    />
                                                ) : (
                                                    <FormInput
                                                        label={label}
                                                        variant="filled"
                                                        id={`${section}-${label}`}
                                                        type="text"
                                                        className="w-full"
                                                        value={value}
                                                        onChange={(e: any) => updateField(section, label, e.target.value)}
                                                        placeholder={`Enter ${label}`}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}

                            <div className="pt-10 border-t border-gray-100 mt-12 flex justify-between items-center">
                                <div className="text-sm text-gray-500 italic max-w-md">
                                    Note: Your AI Assistant uses this information to answer customer queries accurately.
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'} text-white font-bold px-12 py-4 rounded-xl shadow-lg shadow-blue-200 hover:-translate-y-1 transition-all duration-300 text-lg flex items-center gap-2`}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            Saving to Pinecone...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Profile & Continue
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Updating_Website;
