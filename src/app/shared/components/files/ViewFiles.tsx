import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bytesToMB, timeAgo } from '../../utils/utils';
import { awsBucketAddress } from '../../config/address';
import IconTrash from '../../../../_theme/components/Icon/IconTrash';
import { addAlert } from '../../../slices/systemAlertSlice';
import IconStar from '../../../../_theme/components/Icon/IconStar';
import PerfectScrollbar from 'react-perfect-scrollbar';
import LazyImage from '../LazyImage';

interface IViewFilesProps {
    files: any;
    editing?: boolean;
}

function ViewFiles({ files, editing }: IViewFilesProps) {
    const dispatch = useDispatch();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [activeLoadingFileId, setActiveLoadingFileId] = useState<number | null>();

    // const [deletePropertyFile] = useDeleteMenuItemAttachmentMutation();
    // const [markPrimaryFile] = useSetPrimaryAttachmentMutation();

    const imagesExtentions = ['jpeg', 'png', 'jpg', 'gif'];

    const filesRender = () => {
        if (!files.length) return null;
        return files.map((file: any, index: number) => (
            <div
                key={index}
                className={`
                    ${file.isPrimary && 'border-warning border-2'}
                    ${
                        isSubmitting && activeLoadingFileId == file.id && 'animate-pulse'
                    }  relative border shadow-sm flex-col bg-gray-100/30 hover:bg-white-light/20 p-1 rounded-md col-span-12 xs:col-span-6 sm:col-span-3 md:col-span-2 lg:col-span-2 xl:col-span-2 ${
                    activeLoadingFileId === index ? 'animate__backOutDown animate__animated' : 'animate__fadeInUp animate__animated'
                }`}
            >
                <div className="relative">
                    <div className="peer  overflow-hidden rounded-md">
                        <LazyImage src={`${awsBucketAddress}${file.url}`} className="object-cover object-center w-full h-full" alt={file.document_name} />
                    </div>
                    {editing && (
                        <button
                            disabled={isSubmitting}
                            className="peer-hover:opacity-100 hover:opacity-100 flex opacity-0 rounded-md absolute top-1 right-1 transition-all bg-black/60"
                            type="button"
                            title="Remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSubmitting(true);
                                setActiveLoadingFileId(file.id);
                                // deletePropertyFile(file.id)
                                //     .unwrap()
                                //     .then((payload: any) => {
                                //         dispatch(
                                //             addAlert({
                                //                 variant: payload.success ? 'success' : 'warning',
                                //                 message: payload.message,
                                //                 title: payload.success ? 'Success!' : 'Warning!',
                                //             })
                                //         );
                                //     })
                                //     .catch((error: any) => {
                                //         console.log(error);
                                //         dispatch(
                                //             addAlert({
                                //                 variant: `danger`,
                                //                 message: error?.error?.message ?? error?.message ?? 'Failed to delete file.',
                                //                 title: 'Error!',
                                //             })
                                //         );
                                //     })
                                //     .finally(() => {
                                //         setIsSubmitting(false);
                                //         setActiveLoadingFileId(null);
                                //     });
                            }}
                        >
                            <IconTrash className="text-white w-5 h-5" />
                        </button>
                    )}
                    {editing && (
                        <button
                            disabled={isSubmitting}
                            className="peer-hover:opacity-100 hover:opacity-100 flex opacity-0 rounded-md absolute top-1 right-[25px] transition-all bg-black/60"
                            type="button"
                            title="Make Primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSubmitting(true);
                                setActiveLoadingFileId(file.id);
                                // markPrimaryFile(file.id)
                                //     .unwrap()
                                //     .then((payload: any) => {
                                //         dispatch(
                                //             addAlert({
                                //                 variant: payload.success ? 'success' : 'warning',
                                //                 message: payload.message,
                                //                 title: payload.success ? 'Success!' : 'Warning!',
                                //             })
                                //         );
                                //     })
                                //     .catch((error: any) => {
                                //         console.log(error);
                                //         dispatch(
                                //             addAlert({
                                //                 variant: `danger`,
                                //                 message: error?.error?.message ?? error?.message ?? 'Failed to mark primary file.',
                                //                 title: 'Error!',
                                //             })
                                //         );
                                //     })
                                //     .finally(() => {
                                //         setIsSubmitting(false);
                                //         setActiveLoadingFileId(null);
                                //     });
                            }}
                        >
                            <IconStar className="text-warning-light w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div className="flex flex-wrap gap-3 mt-5">
            <h3 className="text-lg font-semibold">Attachments</h3>
            <PerfectScrollbar className="max-h-[calc(255px)] ">
                <div className="grid grid-cols-12 gap-3">{filesRender()}</div>
            </PerfectScrollbar>
        </div>
    );
}

export default ViewFiles;
