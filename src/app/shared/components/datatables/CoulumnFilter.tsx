import { Checkbox, Popover, Badge, Text, ScrollArea, Button } from '@mantine/core';
import React, { useState, ReactNode } from 'react';
import ScrollBar from 'react-perfect-scrollbar';

interface ICoulumnFilterProps {
    columns: any[];
    renderColumns: any[];
    setRenderColumns: React.Dispatch<React.SetStateAction<any[]>>;
    children?: ReactNode;
}

function CoulumnFilter({ columns, renderColumns, setRenderColumns, children }: ICoulumnFilterProps) {
    const [filterPopoverOpened, setFilterPopoverOpened] = useState(false);

    const handleCheckboxChange = (column: any, checked: boolean) => {
        if (checked) {
            setRenderColumns((prev) => {
                const newColumns = [...prev, column];
                return columns.filter((col) => newColumns.some((newCol) => newCol.accessor === col.accessor));
            });
        } else {
            setRenderColumns((prev) => prev.filter((col) => col.accessor !== column.accessor));
        }
    };

    return (
        <Popover width={children ? 300 : 220} position="bottom-start" shadow="md" opened={filterPopoverOpened} onChange={setFilterPopoverOpened}>
            <Popover.Target>
                <button
                    className={`${filterPopoverOpened ? 'border-primary border-[2px]' : 'border-1'} rounded-md flex items-center justify-between border p-2 gap-3 bg-white/90 hover:bg-white`}
                    id="column-filter-menu-button"
                    aria-expanded={filterPopoverOpened}
                    aria-haspopup="true"
                    onClick={() => setFilterPopoverOpened((o) => !o)}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M17.1666 3.41667V5.25C17.1666 5.91667 16.7499 6.75 16.3333 7.16667L12.7499 10.3333C12.2499 10.75 11.9166 11.5833 11.9166 12.25V15.8333C11.9166 16.3333 11.5833 17 11.1666 17.25L9.99995 18C8.91661 18.6667 7.41661 17.9167 7.41661 16.5833V12.1667C7.41661 11.5833 7.08328 10.8333 6.74995 10.4167L6.35828 10.0083C6.09995 9.73333 6.04995 9.31667 6.25828 8.99167L10.5249 2.14167C10.6749 1.9 10.9416 1.75 11.2333 1.75H15.4999C16.4166 1.75 17.1666 2.5 17.1666 3.41667Z"
                            fill="#101010"
                        />
                        <path
                            d="M8.62504 3.025L5.66671 7.76667C5.38337 8.225 4.73337 8.29167 4.35837 7.9L3.58337 7.08333C3.16671 6.66667 2.83337 5.91667 2.83337 5.41667V3.5C2.83337 2.5 3.58337 1.75 4.50004 1.75H7.91671C8.56671 1.75 8.96671 2.46667 8.62504 3.025Z"
                            fill="#101010"
                        />
                    </svg>
                </button>
            </Popover.Target>
            <Popover.Dropdown>
                {children ? (
                    children
                ) : (
                    <>
                        <div className="p-2 border-b flex justify-between items-center">
                            <p className="text-ssm text-gray-400">Table options</p>
                            <button onClick={() => setRenderColumns(columns)} className="text-sm font-medium text-primary">
                                Reset
                            </button>
                        </div>
                        <ScrollBar className="max-h-[270px]  mr-1">
                            {columns.map((column) => (
                                <div key={column.accessor} className="flex items-center p-2 gap-3">
                                    <Checkbox checked={renderColumns.some((col) => col.accessor === column.accessor)} onChange={(e) => handleCheckboxChange(column, e.target.checked)} />
                                    <p className="">{column.title}</p>
                                </div>
                            ))}
                        </ScrollBar>
                    </>
                )}
            </Popover.Dropdown>
        </Popover>
    );
}

export default CoulumnFilter;
