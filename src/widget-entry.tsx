import React from 'react';
import ReactDOM from 'react-dom/client';
import ContactWidget from './app/features/ChatWidget/ContactWidget';
import './tailwind.css';

const script = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s => s.src.includes('widget-entry'));

if (script) {
    const clientId = script.getAttribute('data-client-id');
    const primaryColor = script.getAttribute('data-primary-color') || '#610BFC';
    const secondaryColor = script.getAttribute('data-secondary-color') || '#e5e7eb';

    // Read the base URL, default to production if not provided
    const apiBaseUrl = script.getAttribute('data-api-base-url') || (import.meta.env.VITE_BACKEND_API_ADDRESS?.replace(/\/api$/, '') || 'https://dakia.site');

    // Construct endpoints
    // Ensure apiBaseUrl doesn't have a trailing slash to avoid double slashes
    const baseUrl = apiBaseUrl.replace(/\/$/, '');
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
