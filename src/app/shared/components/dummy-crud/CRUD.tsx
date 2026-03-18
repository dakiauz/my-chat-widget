import { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import IconPencil from '../../../../_theme/components/Icon/IconPencil';
import IconTrashLines from '../../../../_theme/components/Icon/IconTrashLines';
import IconUser from '../../../../_theme/components/Icon/IconUser';
import { setPageTitle } from '../../../../_theme/themeConfigSlice';
import Tooltip from '../ui/Tooltip';
import EditModal from './EditModal';
import Alert from '../../../features/Authentication/components/Alert';

const CRUD = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Users'));
    });
    const [addContactModal, setAddContactModal] = useState<any>(false);

    interface IParamsType {
        id: number;
        name: string;
        description: string;
        phone: string;
        date: string;
    }

    const [value, setValue] = useState<any>('list');
    const [defaultParams] = useState({
        id: null,
        name: '',
        description: '',
        date: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const changeValue = (e: any) => {
        const { name, value } = e.target;
        let newObject = { ...params };
        if (name === 'date') {
            newObject.date = value;
        } else {
            newObject[name] = value;
        }
        setParams((s: IParamsType) => {
            return {
                ...s,
                ...newObject,
            };
        });
    };

    const [search, setSearch] = useState<any>('');
    const [contactList] = useState<any>([
        {
            id: 1,
            name: 'Category Here',
            description: 'This is the description of the category',
            email_verified_at: null,
            date: '2021-09-01',
        },
    ]);

    const [filteredItems, setFilteredItems] = useState<any>(contactList);

    useEffect(() => {
        setFilteredItems(() => {
            return contactList.filter((item: any) => {
                return item.name.toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [search, contactList]);

    const saveUser = () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        if (!params.description) {
            showMessage('Description is required.', 'error');
            return true;
        }
        if (!params.date) {
            showMessage('Role is required.', 'error');
            return true;
        }

        if (params.id) {
            //update user
            let user: any = filteredItems.find((d: any) => d.id === params.id);
            user.name = params.name;
            user.description = params.description;
        } else {
            //add user
            let maxUserId = filteredItems.length ? filteredItems.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredItems[0].id) : 0;

            let user = {
                id: maxUserId + 1,
                name: params.name,
                description: params.description,
                date: params.date,
            };
            filteredItems.splice(0, 0, user);
            //   searchUsers();
        }

        showMessage('User has been saved successfully.');
        setAddContactModal(false);
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
        }
        setAddContactModal(true);
    };

    const deleteUser = (user: any = null) => {
        setFilteredItems(filteredItems.filter((d: any) => d.id !== user.id));
        showMessage('User has been deleted successfully.');
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const feature = 'Category';
    const heading = 'Category Listing';
    return (
        <div className="">
            <div className="">
                <div className="p-6 border-b">
                    <div className="">
                        <Alert variant="success" message="User has been saved successfully." title="Success!" />
                    </div>
                    <div className="flex justify-between">
                        <h1 className="font-bold text-lg">{feature}</h1>
                        <button onClick={() => editUser()} className="bg-brand-600 text-white p-2 rounded-lg text-sm">
                            Create
                        </button>
                    </div>
                </div>
                <div className="px-5 py-2 ">
                    <div className="flex justify-between items-center">
                        <h2 className=" text-md">{heading}</h2>
                        <div className=" flex gap-4">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M11.6665 3.35688V1.16659C11.6665 0.844585 11.9273 0.583252 12.2498 0.583252C12.5724 0.583252 12.8332 0.844585 12.8332 1.16659V4.66659C12.8332 4.84369 12.7543 5.00245 12.6296 5.10946C12.5176 5.20606 12.3763 5.25339 12.2355 5.24992H8.74984C8.42725 5.24992 8.1665 4.98859 8.1665 4.66659C8.1665 4.34459 8.42725 4.08325 8.74984 4.08325H10.7298L10.1096 3.52504C9.255 2.76087 8.15192 2.33912 7.00392 2.33795H6.99984C5.755 2.33795 4.58425 2.82212 3.70284 3.70179C2.82084 4.58262 2.33434 5.75395 2.33317 7.00054C2.33317 7.32254 2.07184 7.58329 1.74984 7.58329C1.42725 7.58329 1.1665 7.32137 1.1665 6.99937C1.16767 5.44129 1.77609 3.97712 2.87917 2.87637C3.9805 1.77679 5.44409 1.17129 6.99984 1.17129H7.00509C8.43892 1.17245 9.8185 1.69979 10.8883 2.65645L11.6665 3.35688Z"
                                        fill="#0B111C"
                                    />
                                    <path
                                        d="M1.74984 13.4166C1.42784 13.4166 1.1665 13.1558 1.1665 12.8333V9.33325C1.1665 9.03883 1.38419 8.79592 1.66701 8.75575C1.69897 8.75115 1.73127 8.7492 1.76355 8.74992H5.24984C5.57184 8.74992 5.83317 9.01067 5.83317 9.33325C5.83317 9.65584 5.57184 9.91659 5.24984 9.91659H3.2704L3.89068 10.4748C4.74526 11.239 5.84834 11.6608 6.99634 11.6619H6.99984C9.57118 11.6619 11.6648 9.57125 11.6671 6.99934C11.6671 6.67734 11.9278 6.41659 12.2498 6.41659C12.5724 6.41659 12.8338 6.6785 12.8332 7.0005C12.8297 10.2153 10.2134 12.8286 6.99926 12.8286H6.99459C5.56018 12.8274 4.18118 12.3001 3.11134 11.3428L2.33317 10.6424V12.8333C2.33317 13.1558 2.07184 13.4166 1.74984 13.4166Z"
                                        fill="#0B111C"
                                    />
                                </svg>
                            </button>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M6.98491 9.33323C6.98987 9.33335 6.99485 9.33341 6.99984 9.33341C7.00528 9.33341 7.0107 9.33334 7.01611 9.33319C7.17546 9.32883 7.31892 9.2606 7.42167 9.15308L10.3289 6.24583C10.557 6.01775 10.557 5.64908 10.3289 5.421C10.1008 5.19292 9.73217 5.19292 9.50409 5.421L7.58317 7.34192V1.75008C7.58317 1.42808 7.32184 1.16675 6.99984 1.16675C6.67784 1.16675 6.4165 1.42808 6.4165 1.75008V7.34191L4.49559 5.421C4.26751 5.19292 3.89884 5.19292 3.67076 5.421C3.44267 5.64908 3.44267 6.01775 3.67076 6.24583L6.57786 9.15293C6.68091 9.26084 6.82494 9.32921 6.98491 9.33323Z"
                                        fill="#0B111C"
                                    />
                                    <path
                                        d="M12.8332 11.0834C12.8332 12.0482 12.048 12.8334 11.0832 12.8334H2.9165C1.95167 12.8334 1.1665 12.0482 1.1665 11.0834V8.75008C1.1665 8.4275 1.42784 8.16675 1.74984 8.16675C2.07184 8.16675 2.33317 8.4275 2.33317 8.75008V11.0834C2.33317 11.4054 2.59509 11.6667 2.9165 11.6667H11.0832C11.4052 11.6667 11.6665 11.4054 11.6665 11.0834V8.75008C11.6665 8.4275 11.9273 8.16675 12.2498 8.16675C12.5724 8.16675 12.8332 8.4275 12.8332 8.75008V11.0834Z"
                                        fill="#0B111C"
                                    />
                                </svg>
                            </button>
                            <button className="border-1 rounded-md flex items-center justify-between border p-2 gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <g clipPath="url(#clip0_1626_27501)">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M0 2.76917C0 1.91951 0.688793 1.23071 1.53846 1.23071H14.4615C15.3112 1.23071 16 1.91951 16 2.76917V13.2307C16 14.0804 15.3112 14.7692 14.4615 14.7692H1.53846C0.688793 14.7692 0 14.0804 0 13.2307V2.76917ZM6.15385 13.5384H9.84615V2.46148H6.15385V13.5384ZM4.92308 2.46148V13.5384H1.53846C1.36853 13.5384 1.23077 13.4006 1.23077 13.2307V2.76917C1.23077 2.59924 1.36853 2.46148 1.53846 2.46148H4.92308ZM11.0769 2.46148V13.5384H14.4615C14.6315 13.5384 14.7692 13.4006 14.7692 13.2307V2.76917C14.7692 2.59924 14.6315 2.46148 14.4615 2.46148H11.0769Z"
                                            fill="#383A3D"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1626_27501">
                                            <rect width="16" height="16" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M6.38569 7.11299C6.17268 7.326 5.82732 7.326 5.61431 7.11299L0.15976 1.65844C-0.0532532 1.44543 -0.0532533 1.10007 0.15976 0.887055C0.372774 0.674042 0.718136 0.674042 0.93115 0.887055L6 5.95591L11.0689 0.887055C11.2819 0.674042 11.6272 0.674042 11.8402 0.887055C12.0533 1.10007 12.0533 1.44543 11.8402 1.65844L6.38569 7.11299Z"
                                        fill="#757575"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="">
                    {/* <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                        <div className="flex gap-3">
                            <div>
                                <button type="button" className="btn btn-success shadow-none hover:shadow-sm hover:shadow-black-light" onClick={() => editUser()}>
                                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                    Add User
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <input type="text" placeholder="Search Users" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                                <IconSearch className="mx-auto" />
                            </button>
                        </div>
                    </div>
                </div> */}

                    {value === 'list' && (
                        <div className="p-0 border-0 overflow-hidden">
                            <div className="table-responsive">
                                <table className=" table-hover">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Date Created</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map((user: any) => {
                                            return (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="flex items-center w-max">
                                                            {/* {!user.path && user.name && (
                                                        <div className="grid place-content-center h-8 w-8 ltr:mr-2 rtl:ml-2 rounded-full bg-primary text-white text-sm font-semibold"></div>
                                                    )} */}
                                                            {!user.name && (
                                                                <div className="border border-gray-300 dark:border-gray-800 rounded-full p-2 ltr:mr-2 rtl:ml-2">
                                                                    <IconUser className="w-4.5 h-4.5" />
                                                                </div>
                                                            )}
                                                            <div>{user.name}</div>
                                                        </div>
                                                    </td>
                                                    <td>{user.description}</td>
                                                    <td className="whitespace-nowrap">{user?.date}</td>
                                                    <td>
                                                        <div className="flex items-center w-max mx-auto gap-2">
                                                            <button type="button" className="" onClick={() => editUser(user)}>
                                                                <Tooltip content="Edit">
                                                                    <button type="button">
                                                                        <IconPencil />
                                                                    </button>
                                                                </Tooltip>
                                                            </button>
                                                            <button type="button" className="" onClick={() => deleteUser(user)}>
                                                                <Tooltip content="Delete">
                                                                    <button type="button">
                                                                        <IconTrashLines />
                                                                    </button>
                                                                </Tooltip>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* <BreadCrumbs label="users" linkLabel="User Management" /> */}

            <EditModal addContactModal={addContactModal} setAddContactModal={setAddContactModal} params={params} changeValue={changeValue} saveUser={saveUser} />
        </div>
    );
};

export default CRUD;
