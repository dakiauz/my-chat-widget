import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';
import backendApiAddress from '../../../shared/config/address';
import { useGetVoicemailDropsQuery, useUploadVoicemailDropMutation, useDeleteVoicemailDropMutation } from '../services/voicemailDropApi';
import { IVoicemailDrop } from '../services/voicemailDropApi';
import { ActionIcon, Button, Loader, Modal, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { IconTrash, IconPlayerPlay, IconPlayerPause, IconUpload, IconMicrophone } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

export default function VoicemailsPage() {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(setPageTitle('Voicemail Drop Library'));
    }, [dispatch]);

    const { data, isLoading, refetch } = useGetVoicemailDropsQuery();
    const [uploadMutation, { isLoading: isUploading }] = useUploadVoicemailDropMutation();
    const [deleteMutation] = useDeleteVoicemailDropMutation();

    const [opened, { open, close }] = useDisclosure(false);
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [duration, setDuration] = useState<number | null>(null);

    const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
    const [playingId, setPlayingId] = useState<number | null>(null);

    const getAudioUrl = (filePath: string) => {
        const base = backendApiAddress.replace(/\/api$/, '');
        return `${base}/storage/${filePath}`;
    };

    const togglePlay = (filePath: string, id: number) => {
        if (playingId === id && activeAudio) {
            activeAudio.pause();
            setActiveAudio(null);
            setPlayingId(null);
        } else {
            if (activeAudio) {
                activeAudio.pause();
            }
            const audioUrl = getAudioUrl(filePath);
            const audio = new Audio(audioUrl);
            audio.play().catch(e => {
                showNotification({ title: 'Error', message: 'Could not play audio. Is the backend serving files correctly?', color: 'red' });
                console.error(e);
            });
            setActiveAudio(audio);
            setPlayingId(id);
            audio.onended = () => {
                setActiveAudio(null);
                setPlayingId(null);
            };
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this recording?')) {
            try {
                await deleteMutation(id).unwrap();
                showNotification({ title: 'Deleted', message: 'Recording deleted successfully', color: 'green' });
            } catch (err) {
                showNotification({ title: 'Error', message: 'Could not delete', color: 'red' });
            }
        }
    };

    const handleUpload = async () => {
        if (!name || (!file && !recordedBlob)) {
            showNotification({ title: 'Error', message: 'Name and audio file are required', color: 'red' });
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        if (file) {
            formData.append('audio', file);
        } else if (recordedBlob) {
            // Browsers default to webm for audio recordings
            formData.append('audio', recordedBlob, 'recording.webm');
        }
        if (duration) {
            formData.append('duration', Math.round(duration).toString());
        }

        try {
            await uploadMutation(formData).unwrap();
            showNotification({ title: 'Success', message: 'Voicemail drop uploaded', color: 'green' });
            close();
            setName('');
            setFile(null);
            setRecordedAudio(null);
            setRecordedBlob(null);
            setDuration(null);
            refetch();
        } catch (err: any) {
            showNotification({ title: 'Error', message: err.data?.message || 'Error uploading file', color: 'red' });
        }
    };

    // Recording Logic
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedAudio(url);
                setRecordedBlob(blob);
                setFile(null); // Clear active file if recorded
                setDuration(null);

                const audio = new Audio(url);
                audio.onloadedmetadata = () => {
                    if (isFinite(audio.duration) && audio.duration > 0) {
                        setDuration(audio.duration);
                    }
                };
            };

            mediaRecorderRef.current.start();
            recordingStartTimeRef.current = Date.now();
            setIsRecording(true);
        } catch (err) {
            console.error('Mic error:', err);
            showNotification({ title: 'Error', message: 'Microphone access denied', color: 'red' });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            const tracks = mediaRecorderRef.current.stream.getTracks();
            tracks.forEach(t => t.stop());
            setIsRecording(false);
            if (recordingStartTimeRef.current) {
                const calcDuration = (Date.now() - recordingStartTimeRef.current) / 1000;
                setDuration(calcDuration);
                recordingStartTimeRef.current = null;
            }
        }
    };

    return (
        <div className="panel p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold">Voicemail Drop Library</h1>
                    <p className="text-gray-500 text-sm">Manage recordings used to dynamically drop into voicemails</p>
                </div>
                <Button color="purple" onClick={open} leftIcon={<IconUpload size={16} />}>Add New Drop</Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-10"><Loader color="purple" /></div>
            ) : (
                <Table className="bg-white border rounded-lg" highlightOnHover>
                    <thead className="bg-gray-50">
                        <tr>
                            <th>Name</th>
                            <th>File Info</th>
                            <th>Duration</th>
                            <th className="w-32 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-400">
                                    No Voicemail Drops found. Add one to get started!
                                </td>
                            </tr>
                        ) : (
                            data?.data.map((drop: IVoicemailDrop) => (
                                <tr key={drop.id}>
                                    <td className="font-semibold">{drop.name}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="blue"
                                                onClick={() => togglePlay(drop.file_path, drop.id)}
                                            >
                                                {playingId === drop.id ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                                            </Button>
                                        </div>
                                    </td>
                                    <td>{drop.duration ? `${drop.duration}s` : 'Unknown'}</td>
                                    <td>
                                        <div className="flex justify-center gap-2">
                                            <Tooltip label="Delete">
                                                <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(drop.id)}>
                                                    <IconTrash size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <Modal opened={opened} onClose={close} title="Add Voicemail Drop" size="md">
                <div className="flex flex-col gap-4">
                    <TextInput
                        label="Recording Name"
                        placeholder="e.g. HVAC Follow-up"
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                        required
                    />

                    <div>
                        <Text size="sm" fw={500} mb={5}>Option 1: Upload Existing File (.mp3, .wav)</Text>
                        <input
                            type="file"
                            accept=".mp3, .wav"
                            onChange={(e) => {
                                const selectedFile = e.target.files ? e.target.files[0] : null;
                                setFile(selectedFile);
                                setRecordedAudio(null);
                                setRecordedBlob(null);
                                setDuration(null);
                                if (selectedFile) {
                                    const audio = new Audio(URL.createObjectURL(selectedFile));
                                    audio.onloadedmetadata = () => {
                                        if (isFinite(audio.duration)) {
                                            setDuration(audio.duration);
                                        }
                                    };
                                }
                            }}
                            className="w-full border p-2 rounded text-sm"
                        />
                    </div>

                    <div className="text-center text-gray-400">OR</div>

                    <div className="border p-4 rounded bg-gray-50 flex flex-col items-center">
                        <Text size="sm" fw={500} mb={3}>Option 2: Record Live</Text>
                        {!isRecording ? (
                            <Button
                                color="red"
                                variant="outline"
                                leftIcon={<IconMicrophone size={16} />}
                                onClick={startRecording}
                            >
                                Start Recording
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-2 items-center">
                                <span className="flex items-center gap-2 text-red-600 animate-pulse font-bold">
                                    <div className="w-2 h-2 rounded-full bg-red-600"></div> Recording...
                                </span>
                                <Button color="dark" onClick={stopRecording}>Stop Recording</Button>
                            </div>
                        )}

                        {recordedAudio && !isRecording && (
                            <div className="w-full mt-4 flex flex-col gap-2">
                                <span className="text-xs text-green-600 text-center font-bold">Audio Ready!</span>
                                <audio src={recordedAudio} controls className="w-full"></audio>
                            </div>
                        )}
                    </div>

                    <Button color="purple" className="mt-4" loading={isUploading} onClick={handleUpload}>
                        Save Voicemail Drop
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
