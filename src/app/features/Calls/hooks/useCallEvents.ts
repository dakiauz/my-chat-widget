import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { baseApi } from '../../../slices/baseApiSlice';
import backendApiAddress from '../../../shared/config/address';

export const useCallEvents = () => {
    const dispatch = useDispatch();
    const auth = useSelector((state: IRootState) => state.auth);
    const companyId = auth?.user?.company?.id;
    const authToken = auth?.token ?? localStorage.getItem('authToken') ?? '';
    const echoRef = useRef<Echo<'reverb'> | null>(null);

    // @ts-ignore
    window.Pusher = Pusher;

    useEffect(() => {
        if (!authToken || !companyId) return;

        // --- Echo Configuration ---
        // Note: In a production app, these should come from env variables
        // @ts-ignore
        echoRef.current = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY || '00yvcmmf59icia963gl5',
            wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
            wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
            wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
            forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: `${backendApiAddress}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: 'application/json',
                },
            },
        });

        const channelName = `company.${companyId}.calls`;
        const channel = echoRef.current.private(channelName);

        // Listen for Recording Processed Event
        channel.listen('.Recording.Processed', (data: any) => {
            console.log('[REALTIME] Call recording processed via WebSocket', data);

            // Invalidate the 'Calls' tag to trigger a background refetch
            // This will make the "Recording" button appear dynamically
            dispatch(baseApi.util.invalidateTags(['Calls']));
        });

        return () => {
            channel.stopListening('.Recording.Processed');
            echoRef.current?.leave(channelName);
            echoRef.current?.disconnect();
            echoRef.current = null;
        };
    }, [authToken, companyId, dispatch]);

    return echoRef.current;
};
