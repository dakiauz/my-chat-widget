import Delete from '../../../shared/components/ui/Delete';
import Modal from '../../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../../shared/components/ui/modals/modal/ModalBody';
import { useDeleteTwilioPhoneNumberMutation } from '../services/TwillioApiSlice';
import { showNotification } from '@mantine/notifications';
import deleteGif from '../../../../_theme/assets/gifs/trash-bin.gif';

type DeleteBodyProps = {
    message?: string;
    close: () => void;
    phoneNumberId: string;
    opened: boolean;
};

function DeleteNumberModal({ message, close, phoneNumberId, opened }: DeleteBodyProps) {
    const [deleteNumber, { isLoading: initiated }] = useDeleteTwilioPhoneNumberMutation();

    const deleteFun = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        await deleteNumber({ phoneNumberId })
            .unwrap()
            .then((res) => {
                showNotification({
                    title: 'Success!',
                    message: res.message ?? 'Phone number deleted successfully.',
                    color: 'green',
                });
            })
            .catch((error: any) => {
                console.log(error);
                showNotification({
                    title: 'Error!',
                    message: error?.data?.message ?? error?.message ?? 'Failed to delete phone number.',
                    color: 'red',
                });
            })
            .finally(() => {
                close();
            });
    };

    return (
        <Modal isOpen={!!opened} close={close}>
            <ModalBody>
                <div className="flex justify-center flex-col items-center space-y-4 mt-5">
                    <img src={deleteGif} alt="delete" className="w-12 h-12" />
                    <p>{message ?? 'Are you sure you want to delete?'}</p>
                    <div className="flex gap-4">
                        <button className="btn bg-BG border-BG shadow-none rounded-lg" onClick={close}>
                            Cancel
                        </button>
                        <button type="button" disabled={initiated} className="btn btn-danger" onClick={deleteFun}>
                            {initiated ? (
                                <>
                                    <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>
                                    Loading
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
}

export default DeleteNumberModal;
