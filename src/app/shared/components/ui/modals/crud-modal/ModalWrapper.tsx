import Modal, { IModalSize } from '../modal/Modal';
import ModalHeader from '../modal/ModalHeader';
import ModalBody from '../modal/ModalBody';

interface ModalWrapperProps {
    isOpen: boolean;
    close: () => void;
    body: JSX.Element;
    headerTitle?: string | null;
    size?: IModalSize;
}

function ModalWrapper({ isOpen, close, body, headerTitle, size }: ModalWrapperProps) {
    return (
        <Modal isOpen={isOpen} close={close} size={size}>
            <>{!!headerTitle && <ModalHeader title={headerTitle} />}</>
            <ModalBody>{body}</ModalBody>
        </Modal>
    );
}

export default ModalWrapper;
