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

console.log("Dakia Widget: Initializing...");
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

    console.log("Dakia Widget: Configuration Loaded", {
        clientId,
        primaryColor,
        finalApiUrl,
        mode: import.meta.env.MODE
    });

    // Construct endpoints
    // Ensure finalApiUrl doesn't have a trailing slash to avoid double slashes
    const baseUrl = finalApiUrl.replace(/\/$/, '');
    const apiEndpoint = `${baseUrl}/api/chat-widget/create`;
    const chatApiEndpoint = `${baseUrl}/api/chat-widget/send`;

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
        />
    );
}
