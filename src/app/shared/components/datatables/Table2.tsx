import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import IconTrashLines from '../../../../_theme/components/Icon/IconTrashLines';
import IconPencil from '../../../../_theme/components/Icon/IconPencil';
import Tooltip from '../ui/Tooltip';
import IconEye from '../../../../_theme/components/Icon/IconEye';
import { useNavigate } from 'react-router-dom';
import ActionMenu from '../ui/buttons/ActionMenu';
import { formatDate, isDateFormat, Record } from '../../utils/utils';
import CrudModal, { CrudModalHandles } from '../ui/modals/crud-modal/CrudModal';
import NoDataFound from './NoDataFound';
import CoulumnFilter from './CoulumnFilter';
import { Box, LoadingOverlay } from '@mantine/core';

interface UsersTable {
    minHeight?: number;
    title: string;
    modalTitle?: string;
    data: any[];
    columns: {
        title: string;
        accessor: string;
        sortable: boolean;
        titleClassName?: string;
        render?: (v: any, index: number) => React.ReactElement;
    }[];
    addTitle?: string;
    AddIcon?: React.ReactElement;
    fetching?: boolean;
    loading?: boolean;
    serial?: boolean;
    actions?: boolean;
    multiActions?: boolean;
    initalSortAccessor?: string;
    opened: boolean;
    open: () => void;
    close: () => void;
    AddBody: React.ReactElement;
    addPermission?: boolean;
    editPermission?: boolean;
    deletePermission?: boolean;
    EditBody: React.ReactElement;
    DeleteBody: React.ReactElement;
    PermissionBody?: React.ReactElement;
    handleSetSelectedData: (data: any) => void;
    restrictAdminRow?: boolean;
    view?: (id: number) => void;
    edit?: (id: number) => void;
    add?: () => void;
    handleRowClick?: (data: any) => Promise<void>;
    className?: string;
    leftSide?: () => JSX.Element;
    rightSide?: () => JSX.Element;
    transferUser?: (id: number) => void;
}

const Table2 = (props: UsersTable) => {
    const navigate = useNavigate();
    //Table Props
    const {
        add,
        restrictAdminRow,
        view,
        edit,
        addPermission,
        editPermission,
        deletePermission,
        title,
        modalTitle,
        data,
        columns,
        handleSetSelectedData,
        addTitle,
        AddIcon,
        fetching,
        loading,
        serial,
        actions,
        multiActions,
        initalSortAccessor,
        minHeight,
        className,
        leftSide,
        rightSide,
        ...modalProps
    } = props;

    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(data);
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: initalSortAccessor ?? '',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        const records = initialRecords.slice(from, to).map((record) => {
            // Map over each key in the record
            const formattedRecord: Record = {};
            Object.keys(record).forEach((key) => {
                const value = record[key];
                formattedRecord[key] = isDateFormat(value) ? formatDate(value) : value && value.trim != '' && value != ' ' ? value : 'n/a';
            });
            return Object.keys(formattedRecord).reduce((acc, key) => {
                if (key == 'extra_fields') return { ...acc, [key]: formattedRecord[key] };

                const value = formattedRecord[key];
                const isDescription = key.toLowerCase().includes('description');
                const truncatedValue = typeof value === 'string' && value.length > (isDescription ? 40 : 20) ? value.substring(0, isDescription ? 40 : 20) + '...' : value;
                return { ...acc, [key]: truncatedValue };
            }, {});
        });
        setRecordsData(records);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const sortedData = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? sortedData.reverse() : sortedData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus, data]);

    const [renderColumns, setRenderColumns] = useState(columns);

    useEffect(() => {
        const query = search.toLowerCase();
        setInitialRecords(() => {
            return data.filter((item: any) => {
                const keys = Object.keys(item) as (keyof any)[];
                return (
                    keys.filter((key) => {
                        if (key == 'permission') {
                            return item.permission.toString().toLowerCase().includes(query);
                        } else if (key === 'city') {
                            if (!item.city) return;
                            // Handle 'city' key separately
                            return item.city?.state?.name.toString().toLowerCase().includes(query) ?? item.city.name.toString().toLowerCase().includes(query);
                        } else {
                            const value = item[key];
                            if (!value) return false;
                            // Ensure the value is a string before calling .toString()
                            if (typeof value === 'number' || typeof value === 'string') {
                                return value.toString().toLowerCase().includes(query);
                            }
                            return false;
                        }
                    }).length > 0
                );
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, data]);

    const actionsColumn = useMemo(() => {
        return {
            accessor: 'action',
            title: 'Action',
            titleClassName: '!text-center',
            sortable: false,
            render: (row: any) => (
                <div className="flex items-center w-max mx-auto gap-2">
                    {props.transferUser && (
                        <Tooltip content="Transfer Data">
                            <button
                                type="button"
                                className="hover-ring"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetSelectedData(row);
                                    if (props.transferUser) props.transferUser(row.id);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-left"><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></svg>
                            </button>
                        </Tooltip>
                    )}
                    {view ? (
                        <Tooltip content="View">
                            <button
                                type="button"
                                className="hover-ring"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetSelectedData(row);
                                    navigate(`/property/${row.id}`);
                                }}
                            >
                                <IconEye />
                            </button>
                        </Tooltip>
                    ) : (
                        <>
                            {editPermission ? (
                                restrictAdminRow && row.id == 1 ? null : (
                                    <Tooltip content="Edit">
                                        <button
                                            type="button"
                                            className="hover-ring"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetSelectedData(row);
                                                crudModalRef.current?.openEdit();
                                            }}
                                        >
                                            <IconPencil />
                                        </button>
                                    </Tooltip>
                                )
                            ) : null}
                        </>
                    )}
                    {deletePermission ? (
                        restrictAdminRow && row.id == 1 ? null : (
                            <Tooltip content="Delete">
                                <button
                                    className="hover-ring"
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetSelectedData(row);
                                        crudModalRef.current?.openDelete();
                                    }}
                                >
                                    <IconTrashLines />
                                </button>
                            </Tooltip>
                        )
                    ) : null}
                </div>
            ),
        };
    }, []);

    const permissionColumn = useMemo(() => {
        return {
            accessor: 'permissions',
            title: 'Permissions',
            titleClassName: '!text-center',
            sortable: false,
            render: (row: any) => (
                <div className="flex items-center w-max mx-auto gap-2">
                    <Tooltip content="Permissions">
                        <button
                            type="button"
                            className="hover-ring"
                            onClick={() => {
                                handleSetSelectedData(row);
                                crudModalRef.current?.openPermission();
                            }}
                        >
                            <IconEye />
                        </button>
                    </Tooltip>
                </div>
            ),
        };
    }, []);

    const serialColumn = useMemo(() => {
        return {
            accessor: 'serial',
            title: 'Sr.',
            titleClassName: '!text-center',
            sortable: false,
            render: (v: any, index: number) => <div className="text-center">{data.findIndex((item) => item.id == v.id) + 1}</div>,
        };
    }, [data, initialRecords]);

    const menuAction = useMemo(() => {
        return {
            accessor: 'action',
            title: 'Action',
            titleClassName: '!text-center',
            sortable: false,
            render: (row: any, index: number) => {
                return (
                    <div className="w-full flex justify-center">
                        <ActionMenu
                            editPermission={Boolean(editPermission)}
                            deletePermission={Boolean(deletePermission)}
                            view={() => {
                                handleSetSelectedData(row);
                                if (view) view(row.id);
                            }}
                            edit={() => {
                                handleSetSelectedData(row);
                                if (edit) edit(row.id);
                            }}
                            remove={() => {
                                handleSetSelectedData(row);
                                crudModalRef.current?.openDelete();
                            }}
                        />
                    </div>
                );
            },
        };
    }, []);

    const statusColumn = useMemo(() => {
        return {
            accessor: 'status',
            title: 'Status',
            titleClassName: '!text-center',
            sortable: true,
            render: (v: any, index: number) => {
                return (
                    <div className="text-center">
                        <span className={`p-2 text-xs capitalize rounded-md text-white ${v.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}>{v.status.toLowerCase()}</span>
                    </div>
                );
            },
        };
    }, [data, initialRecords]);

    // const col = columns.map((c) => c.accessor);
    // const header = columns.map((c) => c.title);

    const compiledColumns = useMemo(() => {
        const newColumns = [...columns];
        if (serial) newColumns.unshift(serialColumn);
        if (modalProps.PermissionBody) newColumns.push(permissionColumn);
        if (actions && (editPermission || deletePermission)) newColumns.push(actionsColumn);
        if (multiActions) newColumns.push(menuAction);

        // change render of status column
        const statusIndex = newColumns.findIndex((c) => c.accessor === 'status');
        if (statusIndex > -1) {
            newColumns[statusIndex] = statusColumn;
        }

        return newColumns;
    }, [columns]);

    useEffect(() => {
        setRenderColumns(compiledColumns);
    }, [compiledColumns]);

    //Modals States
    const crudModalRef = useRef<CrudModalHandles>(null);

    // Checkboxes

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    return (
        <>
            <CrudModal title={modalTitle ?? title} ref={crudModalRef} {...modalProps} />

            <div className={` ${className} h-full flex-col  flex-grow col-span-12 md:col-span-12 flex my-0 py-0 p-6 `}>
                <div className="pb-3 w-full flex flex-col flex-grow h-full overflow-hidden">
                    <div className="py-3 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="w-[13px] rounded-[4px]  h-6 bg-primary"></span>
                            <h1 className="font-bold text-lg">{title}</h1>
                        </div>
                    </div>

                    {data.length == 0 ? (
                        <>
                            <div className="bg-BG px-5 py-2 rounded-lg rounded-b-none ">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-wrap gap-4">
                                        <CoulumnFilter columns={compiledColumns} renderColumns={renderColumns} setRenderColumns={setRenderColumns} />
                                        {leftSide && <div className="flex items-center gap-4">{leftSide()}</div>}
                                    </div>
                                    <div className=" flex gap-4 py-3 items-center">
                                        {/* <button className={`${fetching ? 'animate-spin' : ''}`}>
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
                                                               </button> */}
                                        {rightSide && <div className="flex items-center gap-4">{rightSide()}</div>}
                                        <button
                                            onClick={() => {
                                                if (add) add();
                                                else crudModalRef.current?.openAdd();
                                            }}
                                            className="bg-primary px-6 text-white p-2 rounded-lg text-sm"
                                        >
                                            Add {title}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className=" datatables bg-white rounded-lg rounded-t-none">
                                <Box pos="relative" className="">
                                    <LoadingOverlay visible={!!fetching} zIndex={1000} overlayBlur={1} />
                                    <NoDataFound add={add} crudModalRef={crudModalRef} title={title} />
                                </Box>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-BG px-5 py-2 rounded-lg rounded-b-none ">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-wrap gap-4">
                                        <CoulumnFilter columns={compiledColumns} renderColumns={renderColumns} setRenderColumns={setRenderColumns} />
                                        {leftSide && <div className="flex items-center gap-4">{leftSide()}</div>}
                                    </div>
                                    <div className=" flex gap-4 py-3 items-center">
                                        {/* <button className={`${fetching ? 'animate-spin' : ''}`}>
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
                                        </button> */}
                                        {rightSide && <div className="flex items-center gap-4">{rightSide()}</div>}
                                        <button
                                            onClick={() => {
                                                if (add) add();
                                                else crudModalRef.current?.openAdd();
                                            }}
                                            className="bg-primary px-6 text-white p-2 rounded-lg text-sm"
                                        >
                                            Add {title}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className=" datatables bg-white rounded-lg rounded-t-none">
                                <DataTable
                                    fetching={fetching}
                                    textSelectionDisabled
                                    highlightOnHover
                                    className={`${fetching ? ' animate-pulse pointer-events-none ' : ''}  whitespace-nowrap ${props.handleRowClick ? '' : 'table-cursor-auto'}`}
                                    records={recordsData}
                                    columns={renderColumns}
                                    totalRecords={initialRecords.length}
                                    recordsPerPage={pageSize}
                                    page={page}
                                    onPageChange={(p) => setPage(p)}
                                    recordsPerPageOptions={PAGE_SIZES}
                                    onRecordsPerPageChange={setPageSize}
                                    sortStatus={sortStatus}
                                    onSortStatusChange={setSortStatus}
                                    minHeight={minHeight ?? 350}
                                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                    onRowClick={(row) => {
                                        if (props.handleRowClick) props.handleRowClick(row);
                                    }}
                                    selectedRecords={selectedRecords}
                                    onSelectedRecordsChange={setSelectedRecords}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Table2;
