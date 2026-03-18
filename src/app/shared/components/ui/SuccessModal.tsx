import React from 'react';
import Modal from './modals/modal/Modal';
import ModalBody from './modals/modal/ModalBody';
interface ISuccessModalProps {
    opened: boolean;
    close: () => void;
    text: string;
    title?: string;
}
function SuccessModal({ opened, close, text, title }: ISuccessModalProps) {
    return (
        <Modal title={title ?? 'Update Changes'} isOpen={opened} close={close} size="max-w-xs">
            <ModalBody>
                <div className="flex justify-center items-center flex-col py-4 gap-1">
                    <svg width="45" height="46" viewBox="0 0 45 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.9117 32.1116L10.2456 23.4434L13.1336 20.5554L18.9117 26.3314L30.4638 14.7773L33.3538 17.6674L18.9117 32.1116Z" fill="#1DB83F" />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.0332031 23.3009C0.0332031 10.893 10.0922 0.833984 22.5001 0.833984C34.9079 0.833984 44.967 10.893 44.967 23.3009C44.967 35.7087 34.9079 45.7677 22.5001 45.7677C10.0922 45.7677 0.0332031 35.7087 0.0332031 23.3009ZM22.5001 41.6828C20.0861 41.6828 17.6958 41.2074 15.4656 40.2836C13.2354 39.3598 11.209 38.0058 9.50205 36.2989C7.79512 34.592 6.44112 32.5655 5.51733 30.3353C4.59355 28.1051 4.11809 25.7148 4.11809 23.3009C4.11809 20.8869 4.59355 18.4966 5.51733 16.2664C6.44112 14.0362 7.79512 12.0098 9.50205 10.3028C11.209 8.5959 13.2354 7.2419 15.4656 6.31812C17.6958 5.39433 20.0861 4.91887 22.5001 4.91887C27.3753 4.91887 32.0508 6.85554 35.4981 10.3028C38.9454 13.7501 40.8821 18.4257 40.8821 23.3009C40.8821 28.1761 38.9454 32.8516 35.4981 36.2989C32.0508 39.7462 27.3753 41.6828 22.5001 41.6828Z"
                            fill="#1DB83F"
                        />
                    </svg>
                    <p className="text-center mt-4 text-sm">{text}</p>
                </div>
            </ModalBody>
        </Modal>
    );
}

export default SuccessModal;
