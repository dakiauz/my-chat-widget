import React from 'react';
import ReactDOM from 'react-dom/client';
import ContactWidget from './app/features/ChatWidget/ContactWidget';
import './tailwind.css';

// Browser shims for libraries that expect Node.js environment
if (typeof (window as any).process === 'undefined') {
    (window as any).process = { env: { NODE_ENV: 'production' } };
}
if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
}

const script = document.currentScript as HTMLScriptElement || Array.from(document.getElementsByTagName('script')).find(s => s.src.includes('widget.iife')) as HTMLScriptElement;

console.log("%c 🚀 Dakia Widget: V3 Production - Live Chat Active ", "background: #610BFC; color: #fff; border-radius: 4px; padding: 4px;");
if (!script) {
    console.error("Dakia Widget ERROR: Script tag not found. Ensure the filename contains 'widget.iife'.");
}

if (script) {
    const clientId = script.getAttribute('data-client-id');
    const primaryColor = script.getAttribute('data-primary-color') || '#610BFC';
    const secondaryColor = script.getAttribute('data-secondary-color') || '#e5e7eb';

    // Read the base URL, default to environment variable or fallback to current script location
    const envBackendUrl = (import.meta.env.VITE_BACKEND_API_ADDRESS || '').replace(/\/api$/, '');
    const finalApiUrl = script.getAttribute('data-api-base-url') || envBackendUrl || 'https://dakia.site';


    // Construct endpoints
    // Ensure finalApiUrl doesn't have a trailing slash to avoid double slashes
    const baseUrl = finalApiUrl.replace(/\/$/, '');
    const apiEndpoint = `${baseUrl}/api/chat-widget/create`;
    const chatApiEndpoint = `${baseUrl}/api/chat-widget/send`;

    // Derive Reverb settings from the API URL
    let derivedReverbHost = 'dakia.site';
    let derivedReverbPort = 443;
    try {
        const url = new URL(baseUrl);
        derivedReverbHost = url.hostname;
        derivedReverbPort = url.protocol === 'https:' ? 443 : 8080;
    } catch (e) { }

    const reverbHost = script.getAttribute('data-reverb-host') || derivedReverbHost;
    const reverbPort = parseInt(script.getAttribute('data-reverb-port') || String(derivedReverbPort));
    const reverbAppKey = script.getAttribute('data-reverb-key') || import.meta.env.VITE_REVERB_APP_KEY || '00yvcmmf59icia963gl5';

    const container = document.createElement('div');
    container.id = 'dakia-chat-widget-root';
    document.body.appendChild(container);

    ReactDOM.createRoot(container).render(
        <ContactWidget
            companyId={clientId ? parseInt(clientId) : null}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            apiEndpoint={apiEndpoint}
            chatApiEndpoint={chatApiEndpoint}
            reverbHost={reverbHost}
            reverbPort={reverbPort}
            reverbAppKey={reverbAppKey}
        />
    );
}
