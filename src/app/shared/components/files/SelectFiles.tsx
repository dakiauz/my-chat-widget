import { useEffect, useMemo, useState, useTransition } from 'react';
import { useDispatch } from 'react-redux';
import IconX from '../../../../_theme/components/Icon/IconX';
import { useDropzone } from 'react-dropzone';
import { bytesToMB } from '../../utils/utils';
import { Badge, Box, LoadingOverlay } from '@mantine/core';
import IconFile from '../../../../_theme/components/Icon/IconFile';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useFormik } from 'formik';
import Tooltip from '../ui/Tooltip';
import { addAlert } from '../../../slices/systemAlertSlice';
import SelectFileUi from './SelectFileUi';
import LazyImage from '../LazyImage';

interface SelectFilesProps {
    close: () => void;
    upload: (files: File[]) => Promise<any>;
    input?: boolean;
    selectedFiles?: File[];
    editing?: boolean;
    single?: boolean;
}

const SelectFiles = ({ close, upload, input, editing, selectedFiles, single }: SelectFilesProps) => {
    const dispatch = useDispatch();
    const [pending, startTransition] = useTransition();
    const [isDragging, setIsDragging] = useState(false); // Track if a file is being dragged
    const [errorMsg, setErrorMsg] = useState<string>(''); // Track error message
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
        },
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        onDropAccepted: (acceptedFiles) => {
            setIsDragging(false);
            setErrorMsg('');
            handleAcceptedFiles(acceptedFiles);
        },
        onDropRejected: () => {
            setIsDragging(false);
            setErrorMsg('Invalid file type');
        },
    });
    const [files, setFiles] = useState<File[]>([]);
    useEffect(() => {
        upload(files);
    }, [files]);
    const [activeDeleteFile, setActiveDeleteFile] = useState<number | null>();
    const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({}); // Track loading for individual files
    const [placeholders, setPlaceholders] = useState<string[]>([]); // Track placeholders for loading images

    const handleAcceptedFiles = (acceptedFiles: File[]) => {
        if (!(acceptedFiles.length > 0)) return;
        const newLoadingFiles = { ...loadingFiles };
        const newPlaceholders = [...placeholders];
        if (single) {
            setFiles(acceptedFiles.slice(0, 1));
        } else {
            acceptedFiles.forEach((file) => {
                const uniqueKey = file.name;
                newLoadingFiles[uniqueKey] = true;
                newPlaceholders.push(uniqueKey);
            });

            setLoadingFiles(newLoadingFiles);
            setPlaceholders(newPlaceholders);

            acceptedFiles.forEach((file, index) => {
                const uniqueKey = file.name;
                setTimeout(() => {
                    setFiles((prev) => [...prev, file]);
                    setLoadingFiles((prev) => ({
                        ...prev,
                        [uniqueKey]: false,
                    }));
                    setPlaceholders((prev) => prev.filter((key) => key !== uniqueKey));
                }, index * 100); // Sequential delay
            });
        }
    };

    const filesRender = useMemo(() => {
        return (
            selectedFiles &&
            selectedFiles.map((file, index) => (
                <div
                    key={index}
                    className={`relative border shadow-sm flex-col bg-gray-100/30 hover:bg-white-light/20 p-1 rounded-md col-span-12 xs:col-span-6 sm:col-span-3 md:col-span-2 lg:col-span-2 xl:col-span-2 ${
                        activeDeleteFile === index ? 'animate__backOutDown animate__animated' : 'animate__fadeInUp animate__animated'
                    }`}
                >
                    <div className="relative">
                        <div className="peer aspect-video overflow-hidden rounded-md">
                            {loadingFiles[file.name] ? (
                                <div className="skeleton-loader aspect-video bg-gray-200 animate-pulse"></div>
                            ) : (
                                <LazyImage src={URL.createObjectURL(file)} className="object-cover object-center w-full h-full" alt={file.name} />
                            )}
                        </div>
                        <button
                            className="peer-hover:opacity-100 hover:opacity-100 flex opacity-0 rounded-md absolute top-1 right-1 transition-all bg-black/60"
                            type="button"
                            title="Remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveDeleteFile(index);
                                startTransition(() => {
                                    setFiles((prev) => prev.filter((f) => f.name !== file.name));
                                    setActiveDeleteFile(null);
                                });
                            }}
                        >
                            <IconX className="text-white w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-1 flex gap-1 flex-col bg-white">
                        <p className="text-xs truncate font-semibold">{file.name}</p>
                        <p className="text-xs text-white-dark/70">{parseFloat(bytesToMB(parseInt(`${file.size}`)).toString()).toFixed(1)} MB</p>
                    </div>
                </div>
            ))
        );
    }, [selectedFiles, loadingFiles, activeDeleteFile]);

    const placeholderRender = useMemo(() => {
        return placeholders.map((key) => (
            <div key={key} className="relative border shadow-sm flex-col bg-gray-100/30 p-1 rounded-md col-span-12 xs:col-span-6 sm:col-span-3 md:col-span-2 lg:col-span-2 xl:col-span-2">
                <div className="skeleton-loader aspect-video bg-gray-200 animate-pulse"></div>
                <div className="mt-1 flex flex-col bg-white">
                    <p className="text-xs truncate font-semibold">Loading...</p>
                </div>
            </div>
        ));
    }, [placeholders]);

    return (
        <div>
            {!input ? (
                <div className="space-y-8">
                    <div className="multiple-file-upload">
                        <Box pos="relative">
                            <LoadingOverlay visible={pending} zIndex={1000} overlayBlur={1} />
                            <div className="relative">
                                <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} type="file" />
                                    <SelectFileUi name={single ? files[0]?.name : null} />

                                    <div>
                                        {errorMsg && (
                                            <Badge color="red" className="mt-2">
                                                {errorMsg}
                                            </Badge>
                                        )}
                                    </div>
                                    {isDragging && (
                                        <div className="rounded-md absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
                                            <p className="text-white text-lg animate-bounce">Drop the files here...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {!single && (
                                <PerfectScrollbar className="max-h-[calc(255px)] mt-5">
                                    <div className="grid grid-cols-12 gap-3">
                                        {placeholderRender} {/* Render placeholders */}
                                        {filesRender} {/* Render loaded files */}
                                    </div>
                                </PerfectScrollbar>
                            )}
                        </Box>
                    </div>
                </div>
            ) : (
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} type="file" />
                    <button type="button" className="form-input placeholder:!font-nunito p-2 px-4 text-white-dark w-full rounded-md text-left">
                        {files.length === 0 ? 'Choose Files...' : `Choose Files (${files.length})`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SelectFiles;
