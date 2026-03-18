'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { Play, Phone, Search, Download, Copy, FileText, Clock, User, Mic, Loader2, FileTextIcon } from 'lucide-react';
import { Badge, Button, Progress } from '@mantine/core';

import FormInput from '../../../../shared/components/forms/FormInput';
import { ITranscription } from '../../models/calls';
import { CallLog } from '../../types';
import { useGetTranscriptionByIdQuery } from '../../../Integrations/services/TwillioApiSlice';
import { getInitials } from '../../../../shared/utils/utils';

interface ITranscriptModalBody {
    transcription: ITranscription[];
    setTranscription: React.Dispatch<React.SetStateAction<ITranscription[]>>;
    callLog: CallLog;
}

export default function TranscriptModalBody({ transcription, setTranscription, callLog }: ITranscriptModalBody) {
    const [transcriptProgress, setTranscriptProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const progressRef = useRef<NodeJS.Timeout | null>(null);

    const { data: transcriptionData, isLoading: isLoadingTranscription } = useGetTranscriptionByIdQuery(callLog.recording[0]?.transcript?.transcriptSid ?? '', {
        skip: !callLog.recording[0]?.transcript?.transcriptSid,
    });
    const [progress, setProgress] = useState(0);

    const startTransitionProgress = () => {
        if (progressRef.current) clearInterval(progressRef.current);
        setProgress(0);
        progressRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressRef.current!);
                    return 100;
                }
                return prev + 10;
            });
        }, 1000);
    };

    useEffect(() => {
        if (!callLog.recording[0]?.transcript?.transcriptSid) {
            setTranscriptProgress(100);
            if (progressRef.current) clearInterval(progressRef.current);
            return;
        } else {
            startTransitionProgress();
        }
        if (!transcriptionData?.transcription) return setTranscriptProgress(0);
        let data = transcriptionData.transcription;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Failed to parse transcription string", e);
                data = [];
            }
        }
        setTranscription(Array.isArray(data) ? data : []);
        setTranscriptProgress(100);
        if (progressRef.current) clearInterval(progressRef.current);
    }, [transcriptionData?.transcription]);

    const formatTime = (timeStr: string) => {
        const seconds = Number.parseFloat(timeStr);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const copyTranscript = async () => {
        if (transcription.length == 0) return;
        const text = transcription.map((segment) => `${segment.speaker}: ${segment.text}`).join('\n\n');
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadTranscript = () => {
        if (transcription.length == 0) return;
        const text = transcription.map((segment) => `[${formatTime(segment.startTime)}] ${segment.speaker}: ${segment.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${callLog.contactName.replace(' ', '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredTranscript = Array.isArray(transcription)
        ? transcription.filter((segment) =>
            segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            segment.speaker.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <>
            <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileTextIcon className="w-5 h-5 text-purple-600" />
                        <h4 className="text-lg font-semibold">Call Transcript</h4>
                    </div>
                    <div className="flex items-center gap-2 mr-4">
                        <Button className="border-gray-200 rounded-lg" color="dark" variant="outline" size="sm" onClick={copyTranscript}>
                            <Copy className="w-4 h-4 mr-2" />
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button className="border-gray-200 rounded-lg" color="dark" variant="outline" size="sm" onClick={downloadTranscript}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {callLog.contactName}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Duration: {callLog.callDuration ? formatTime(callLog.callDuration) : '0:00'}
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {callLog.phone}
                    </div>
                </div>
            </div>
            <div className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <>
                    {/* Search */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <FormInput
                                placeholder="Search transcript..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Transcript Content */}
                    <div className="flex-1 overflow-y-auto">
                        {transcriptProgress == 100 || transcription.length != 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredTranscript?.map((segment, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-24">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${segment.speaker === 'Agent' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        {getInitials(segment.speaker)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{segment.speaker}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono ml-8">{formatTime(segment.startTime)}</div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-800 leading-relaxed">
                                                    {searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase())
                                                        ? segment.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                                                            part.toLowerCase() === searchQuery.toLowerCase() ? (
                                                                <mark key={i} className="bg-yellow-200 px-1 rounded">
                                                                    {part}
                                                                </mark>
                                                            ) : (
                                                                part
                                                            )
                                                        )
                                                        : segment.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600">Transcript is being generated...</p>
                                    <Progress value={transcriptProgress} className="mt-4" size="lg" color="violet" radius="md" striped animate style={{ width: '300px' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            </div>
        </>
    );
}
