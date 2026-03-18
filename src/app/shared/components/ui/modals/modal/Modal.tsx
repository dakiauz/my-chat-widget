import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { FC, Fragment } from 'react';
import IconX from '../../../../../../_theme/components/Icon/IconX';

export type IModalSize = 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl'| 'max-w-3xl'  | 'max-w-4xl' | 'max-w-full' | 'max-w-xs';

type ModalProps = {
    isOpen: boolean;
    close: () => void;
    children: JSX.Element | JSX.Element[];
    size?: IModalSize;
    title?: string;
};

function Modal(props: ModalProps): ReturnType<FC> {
    const { close, isOpen, children, size, title } = props;
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={close} className="relative z-[51]">
                <TransitionChild as={Fragment} enter="ease-out duration-300 " enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-2 py-8">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className={`${size ? size : 'max-w-lg'} !overflow-visible panel border-0 p-0 rounded-lg overflow-x-hidden w-full  text-black dark:text-white-dark`}>
                                {title && (
                                    <div className="pl-4 pt-5 border-gray-200 dark:border-gray-700">
                                        <h2 className=" text-xsm font-bold">{title}</h2>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={close}
                                    className=" -scale-75 w-2 absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none z-10"
                                >
                                    <IconX />
                                </button>
                                {children}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default Modal;
