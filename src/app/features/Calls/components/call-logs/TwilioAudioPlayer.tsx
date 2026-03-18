import React, { useRef, useState, useEffect } from 'react';
import { ICallLogRecording } from '../../models/calls';
import backendApiAddress from '../../../../shared/config/address';
import { Download, Loader2 } from 'lucide-react';
import { Loader } from '@mantine/core';
import { formatTimeAgo } from '../../utils/helpers';

const fetchAudioBlob = async (url: string, userName?: string, password?: string) => {
    const headers: HeadersInit = {};
    if (userName && password) {
        headers['Authorization'] = 'Basic ' + btoa(`${userName}:${password}`);
    }

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch audio');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

const TwilioAudioPlayer = ({ recording, userName, password }: { recording: ICallLogRecording[]; userName: string; password: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [src, setSrc] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
    const [isDragging, setIsDragging] = useState(false);

    const handleDownload = async () => {
        if (!src || !recording[0]) return;

        try {
            // Fetch as a blob ONLY on download to avoid redirecting the browser
            // We do this here instead of in useEffect to avoid CORS issues during initial player load
            let downloadUrl = src;

            // If it's a Twilio URL, we need to use the credentialed fetch
            if (downloadUrl.includes('twilio.com')) {
                downloadUrl = await fetchAudioBlob(downloadUrl, userName, password);
            } else if (!downloadUrl.startsWith('blob:')) {
                // For our own server, fetch the blob now
                downloadUrl = await fetchAudioBlob(downloadUrl);
            }

            const createdAt = new Date(recording[0].created_at);
            const formattedDate = createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const fileName = `${formattedDate} recording.mp3`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the created object URL if it was a blob we just fetched
            if (downloadUrl.startsWith('blob:') && downloadUrl !== src) {
                URL.revokeObjectURL(downloadUrl);
            }
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: if fetch failed, just open the raw URL in a new tab
            window.open(src, '_blank');
        }
    };

    useEffect(() => {
        let url = recording[0].recordingUrl;

        // Backwards compatibility: raw Twilio URLs might not have an extension
        if (!url.endsWith('.mp3') && !url.endsWith('.wav')) {
            url += '.mp3';
        }

        // --- Dynamic Backend Resolver ---
        const protocolAndDomain = backendApiAddress.replace(/\/api$/, '');

        if (url.includes('ngrok-free.dev') || url.includes('localhost:8000') || url.includes(protocolAndDomain) || url.startsWith('/storage')) {
            url = url.replace(/https?:\/\/[^\/]+/, protocolAndDomain);
            if (url.startsWith('/storage')) url = protocolAndDomain + url;
        }

        setStatus('loading');

        // Logic Change: Use raw URL for playback (more resilient to CORS)
        // and only use fetchAudioBlob for Twilio (which requires Auth headers)
        if (url.includes('twilio.com')) {
            fetchAudioBlob(url, userName, password)
                .then((blobUrl) => {
                    setSrc(blobUrl);
                    setStatus('ready');
                })
                .catch(() => setStatus('error'));
        } else {
            // For local server, set it directly. 
            // Standard <audio> tag is more lenient with CORS than fetch()
            setSrc(url);
            setStatus('ready');
        }
    }, [recording, userName, password]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60)
            .toString()
            .padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio && audio.duration && !isDragging) {
            setProgress((audio.currentTime / audio.duration) * 100);
            setCurrentTime(audio.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        const audio = audioRef.current;
        if (audio) {
            setDuration(audio.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const bar = progressRef.current;
        if (audio && bar && duration) {
            const rect = bar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const seekTime = (clickX / rect.width) * duration;
            audio.currentTime = seekTime;
            setProgress((clickX / rect.width) * 100);
            setCurrentTime(seekTime);
        }
    };

    const handleThumbDragStart = () => {
        setIsDragging(true);
    };

    const handleThumbDrag = (e: MouseEvent) => {
        if (!isDragging) return;
        const bar = progressRef.current;
        if (bar && duration) {
            const rect = bar.getBoundingClientRect();
            const dragX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const seekTime = (dragX / rect.width) * duration;
            setProgress((dragX / rect.width) * 100);
            setCurrentTime(seekTime);
            if (audioRef.current) {
                audioRef.current.currentTime = seekTime;
            }
        }
    };

    const handleThumbDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleThumbDrag);
            window.addEventListener('mouseup', handleThumbDragEnd);
        } else {
            window.removeEventListener('mousemove', handleThumbDrag);
            window.removeEventListener('mouseup', handleThumbDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleThumbDrag);
            window.removeEventListener('mouseup', handleThumbDragEnd);
        };
    }, [isDragging]);

    // if (status === 'loading') {
    //     return <div className="p-2 mb-2 text-purple-600 bg-[#f5eeff] rounded-md w-full max-w-md text-center">Loading audio...</div>;
    // }

    if (status === 'error') {
        return <div className="p-4 text-red-600 bg-red-100 rounded-md w-full max-w-md text-center">Failed to load audio.</div>;
    }

    return (
        <div className="flex items-center gap-2 w-full max-w-md bg-transparent p-2 rounded-full">
            <button
                className="mr-1"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    togglePlay();
                }}
            >
                {status === 'loading' ? (
                    <Loader className="w-5 h-5" color="violet" />
                ) : isPlaying ? (
                    <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.750001 0.75C0.750001 0.335786 1.08579 0 1.5 0H3C3.41421 0 3.75 0.335786 3.75 0.75V14.25C3.75 14.6642 3.41421 15 3 15H1.5C1.30109 15 1.11032 14.921 0.96967 14.7803C0.829018 14.6397 0.75 14.4489 0.75 14.25L0.750001 0.75ZM8.25 0.75C8.25 0.335786 8.58579 0 9 0H10.5C10.6989 0 10.8897 0.0790177 11.0303 0.21967C11.171 0.360322 11.25 0.551088 11.25 0.75V14.25C11.25 14.6642 10.9142 15 10.5 15H9C8.58579 15 8.25 14.6642 8.25 14.25V0.75Z"
                            fill="#610BFC"
                        />
                    </svg>
                ) : (
                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.5 2.15306C0.5 0.726931 2.029 -0.177123 3.2786 0.510157L14.8192 6.85748C16.1144 7.56984 16.1144 9.43093 14.8192 10.1433L3.2786 16.4906C2.029 17.1779 0.5 16.2738 0.5 14.8477V2.15306Z"
                            fill="#610BFC"
                        />
                    </svg>
                )}
            </button>
            <div className="relative flex-1 h-2 bg-[#e0d2f8] rounded-full cursor-pointer" ref={progressRef} onClick={handleSeek}>
                <div className="absolute h-full bg-primary rounded-full" style={{ width: `${progress}%` }}>
                    {/* thumb */}
                    <div className="absolute top-[-4px] -right-3 w-4 h-4 bg-white rounded-full border-[4px] border-primary cursor-grab" onMouseDown={handleThumbDragStart}></div>
                </div>
            </div>
            <span className="text-primary text-sm font-medium w-12 text-right">{formatTime(currentTime)}</span>
            <Download
                className="text-primary w-5 h-5 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                }}
            />
            <audio ref={audioRef} src={src || undefined} preload="metadata" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} />
        </div>
    );
};

export default TwilioAudioPlayer;
