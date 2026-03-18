import { useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useDisclosure } from '@mantine/hooks';
import ImportModal from './ImportModal';
import ModalWrapper from '@/app/shared/components/ui/modals/crud-modal/ModalWrapper';

interface IImportDataProps {
    submit: (data: any) => Promise<any>;
    title: string;
}

export interface IRowError {
    row: number;
    errors: string[];
}

function ImportData({ submit, title }: IImportDataProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [warningOpened, setWarningOpened] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [formattedRows, setFormattedRows] = useState([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        validation.setSubmitting(true);
        const file = e.target.files?.[0];
        if (file) {
            validation.setFieldValue('file', file);
        }
    };

    const validation = useFormik({
        initialValues: {
            file: '',
        },
        onSubmit: async (values) => {
            if (!submit) return;

            try {
                const res: any = await submit(values);

                if (res?.success) {
                    const hasFileHeaders = !!res?.file_headers;
                    const hasInvalidRows = Array.isArray(res?.invalid_rows) && res.invalid_rows.length > 0;

                    if (hasFileHeaders && !hasInvalidRows) {
                        open();
                        return;
                    }

                    if (hasFileHeaders && hasInvalidRows) {
                        setFormattedRows(res.invalid_rows);
                        setWarningMessage(res.message ?? 'Some rows are invalid. Do you want to skip invalid rows and continue?');
                        setWarningOpened(true);
                        return;
                    }

                    if (res?.message && !hasInvalidRows && !hasFileHeaders) {
                        setWarningMessage(res.message);
                        setWarningOpened(true);
                        return;
                    }
                } else {
                    const message = res?.message || res?.error || 'Data import failed';
                    Swal.fire({
                        title: 'Error',
                        text: message,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        timerProgressBar: true,
                        timer: 3000,
                    });
                }
            } catch (error: any) {
                const message = error?.data?.message || error?.data?.error || error?.message || 'Data import failed';

                Swal.fire({
                    title: 'Error',
                    text: message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    timerProgressBar: true,
                    timer: 3000,
                });
            } finally {
                fileRef.current!.value = '';
                validation.setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        if (validation.values.file) {
            validation.handleSubmit();
        }
    }, [validation.values.file]);

    return (
        <>
            <ImportModal opened={opened} open={open} close={close} title={title} />
            <button
                type="button"
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-600 hover:to-green-600 text-white font-semibold px-4 min-w-[120px] rounded-lg p-2 flex items-center justify-center gap-2 transition-all duration-300"
                disabled={validation.isSubmitting}
                onClick={() => {
                    fileRef.current?.click();
                }}
            >
                <input ref={fileRef} type="file" accept=".csv, .xls, .xlsx," className="hidden" onChange={handleFileChange} />
                {validation.isSubmitting ? (
                    <span className="flex items-center justify-center gap-4">
                        <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5"></span>
                        Importing
                    </span>
                ) : (
                    'Import'
                )}
            </button>
            <ModalWrapper
                isOpen={warningOpened}
                close={() => setWarningOpened(false)}
                headerTitle="Warning"
                size="max-w-md"
                body={
                    <div className="flex flex-col gap-4 p-2">
                        <p className="text-gray-700 text-sm">{warningMessage}</p>
                        {formattedRows &&
                            formattedRows.length > 0 &&
                            formattedRows?.map((invalidRow: { row: number; reason: string }, index: number) => (
                                <div key={index} className="bg-gray-100 p-1 rounded">
                                    <pre className="text-xs overflow-x-auto">
                                        Row No {invalidRow.row}: {invalidRow.reason}
                                    </pre>
                                </div>
                            ))}

                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setWarningOpened(false)} className="px-4 py-2 bg-gray-300 rounded-full font-semibold">
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    setWarningOpened(false);
                                    open();
                                }}
                                className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                Skip & Continue
                            </button>
                        </div>
                    </div>
                }
            />
        </>
    );
}

export default ImportData;
