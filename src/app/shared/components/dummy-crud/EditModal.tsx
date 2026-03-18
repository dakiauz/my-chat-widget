import { Dialog, Transition } from '@headlessui/react';
import React, { FC, Fragment } from 'react';
import IconX from '../../../../_theme/components/Icon/IconX';

type EditModalProps = {
    addContactModal: boolean;
    setAddContactModal: (value: boolean) => void;
    params: {
        id: number;
        name: string;
        description: string;
        phone: string;
        date: string;
    };
    changeValue: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    saveUser: () => void;
};

function EditModal(props: EditModalProps): ReturnType<FC> {
    const { addContactModal, setAddContactModal, params, changeValue, saveUser } = props;
    return (
        <Transition appear show={addContactModal} as={Fragment}>
            <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setAddContactModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    {params.id ? 'Edit Category' : 'Add Category'}
                                </div>
                                <div className="p-5">
                                    <form>
                                        <div className="mb-5">
                                            <label htmlFor="userName">Name</label>
                                            <input id="userName" name="name" type="text" placeholder="Enter Name" className="form-input" value={params.name} onChange={(e) => changeValue(e)} />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="description">Description</label>
                                            <input
                                                id="description"
                                                name="description"
                                                type="text"
                                                placeholder="Enter Description"
                                                className="form-input"
                                                value={params.description}
                                                onChange={(e) => changeValue(e)}
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="date">Date</label>
                                            <input id="date" name="date" type="text" placeholder="Enter Date" className="form-input" value={params.date} onChange={(e) => changeValue(e)} />
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn bg-BG border-BG  shadow-none  rounded-lg" onClick={() => setAddContactModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                {params.id ? 'Update' : 'Add'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default EditModal;
