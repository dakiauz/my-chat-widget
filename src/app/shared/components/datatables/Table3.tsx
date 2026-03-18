import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useMemo, useState } from 'react';
import sortBy from 'lodash/sortBy';
import IconSearch from '../../../../_theme/components/Icon/IconSearch';
import Tooltip from '../ui/Tooltip';
import IconPencil from '../../../../_theme/components/Icon/IconPencil';
import IconTrashLines from '../../../../_theme/components/Icon/IconTrashLines';

interface UsersTable {
    data: any[];
    columns: {
        title: string;
        accessor: string;
        sortable: boolean;
        titleClassName?: string;
        render?: (v: any, index: number) => React.ReactElement;
    }[];
    fetching?: boolean;
    serial?: boolean;
    actions?: boolean;
    initalSortAccessor?: string;

    editPermission?: boolean;
    deletePermission?: boolean;
    addPermission?: boolean;

    handleEdit: (row: any) => void;
    handleDelete: (row: any) => void;
    handleAdd: () => void;

    addTitle?: string;
    AddIcon?: React.ReactElement;
}

const Table3 = (props: UsersTable) => {
    //Table Props
    const { data, columns, fetching, addTitle, handleAdd, addPermission, AddIcon, serial, initalSortAccessor, actions, editPermission, deletePermission, handleEdit, handleDelete } = props;

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
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const sortedData = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? sortedData.reverse() : sortedData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus, data]);

    useEffect(() => {
        setInitialRecords(() => {
            return data.filter((item: any) => {
                const keys = Object.keys(item) as (keyof any)[];
                return (
                    keys.filter((key) => {
                        if (key == 'permission') {
                            return item.permission.toString().toLowerCase().includes(search.toLowerCase());
                        } else {
                            const value = item[key];
                            if (!value) return false;
                            // Ensure the value is a string before calling .toString()
                            return typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase());
                        }
                    }).length > 0
                );
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, data]);

    const serialColumn = useMemo(() => {
        return {
            accessor: 'serial',
            title: 'ID',
            titleClassName: '!text-center',
            sortable: false,
            render: (v: any, index: number) => <div className="text-center">{data.indexOf(v) + 1}</div>,
        };
    }, [data, initialRecords]);

    const actionsColumn = useMemo(() => {
        return {
            accessor: 'action',
            title: 'Action',
            titleClassName: '!text-center',
            sortable: false,
            render: (row: any) => (
                <div className="flex items-center w-max mx-auto gap-2">
                    <>
                        {editPermission ? (
                            <Tooltip content="Edit">
                                <button
                                    type="button"
                                    className="hover-ring"
                                    onClick={() => {
                                        handleEdit(row);
                                    }}
                                >
                                    <IconPencil />
                                </button>
                            </Tooltip>
                        ) : null}
                    </>
                    {deletePermission ? (
                        <Tooltip content="Delete">
                            <button
                                className="hover-ring"
                                type="button"
                                onClick={() => {
                                    handleDelete(row);
                                }}
                            >
                                <IconTrashLines />
                            </button>
                        </Tooltip>
                    ) : null}
                </div>
            ),
        };
    }, []);

    const renderColumns: any[] = useMemo(() => {
        const newColumns = [...columns];
        if (serial) newColumns.unshift(serialColumn);
        if (actions && (editPermission || deletePermission)) newColumns.push(actionsColumn);
        return newColumns;
    }, [columns]);

    return (
        <>
            <div>
                <div className="panel">
                    <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Additional Fields </h5>
                        <div className="ltr:ml-auto rtl:mr-auto flex gap-4">
                            <div className="relative">
                                <input type="text" placeholder="Search..." className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                                <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                                    <IconSearch className="mx-auto" />
                                </button>
                            </div>
                            {addTitle && addPermission && (
                                <button type="button" className="btn btn-success shadow-none hover:shadow-sm hover:shadow-black-light" onClick={handleAdd}>
                                    {!!AddIcon && AddIcon}
                                    {addTitle}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            fetching={fetching}
                            textSelectionDisabled
                            highlightOnHover
                            className="whitespace-nowrap"
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
                            minHeight={350}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Table3;
