import React, { useMemo } from 'react';
import { IPermission } from '../../models/roles';
import { Checkbox } from '@mantine/core';
import { useGetPermissionsQuery } from '../../services/rolesApi';

interface ISelectPermissionsProps {}

function SelectPermissions(): JSX.Element {
    const { data: permissionsData } = useGetPermissionsQuery();

    const permissions: number[] = [];

    const sections: string[] = useMemo(() => {
        if (!permissionsData?.data) return [];
        else {
            return Array.from(new Set(permissionsData.data.map((permission: IPermission) => permission.name.split(' ')[1])));
        }
    }, [permissionsData?.data]);
    return (
        <div className="my-3 col-span-12">
            {sections.map((section: string, index: number) => {
                return (
                    <div key={section} className={`${index == 0 && '!pt-0 -mt-3'} grid grid-cols-12 border-b border-b-white-light/50 py-4 space-y-3 sm:space-y-0`}>
                        <div className="col-span-12 sm:col-span-5 ">
                            <h4 className="flex items-center gap-2 text-sm font-semibold">
                                <span>{section}</span>
                            </h4>
                        </div>
                        <div className="grid grid-cols-12 col-span-12 sm:col-span-7 gap-2">
                            {permissionsData.data
                                ?.filter((permission: IPermission) => permission.name.split(' ')[1] === section)
                                .map((permission: IPermission) => {
                                    return (
                                        <div key={permission?.id} className="col-span-6 md:col-span-3 flex items-center gap-2">
                                            <Checkbox
                                                onClick={() => {
                                                    if (permissions.includes(permission.id)) {
                                                        const index = permissions.indexOf(permission.id);
                                                        permissions.splice(index, 1);
                                                    } else {
                                                        permissions.push(permission.id);
                                                    }
                                                }}
                                                id="c1"
                                                color="#fff"
                                                checked={permissions.includes(permission.id)}
                                            />
                                            <label htmlFor="c1" className="text-sm m-0 text-white-dark/80">
                                                {permission.name.split(' ')[0]}
                                            </label>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SelectPermissions;
