import { Button } from '@mantine/core';
import { Briefcase, ClipboardList, Shield, Users } from 'lucide-react'; // Added ClipboardList for Tasks
import { useMemo } from 'react';
import IconListCheck from '../../../../../../_theme/components/Icon/IconCheck';
import { IPermission } from '../../models/roles';
import { useGetPermissionsQuery } from '../../services/rolesApi';
import { getFeatureSectionIcon } from '../RolesForm';

interface IPermissionBodyProps {
    close: () => void;
    permissions: number[];
}

function PermissionBody({ close, permissions }: IPermissionBodyProps) {
    const { data: permissionsData, isLoading, error } = useGetPermissionsQuery();

    if (isLoading) return <p>Loading permissions...</p>;
    if (error) return <p>Error loading permissions.</p>;

    const permissionsState: IPermission[] = Array.isArray(permissionsData?.data?.permissions) ? permissionsData.data.permissions : [];

    const featureSections = useMemo(() => {
        if (!permissionsState) return [];
        let uniquePermissions = [...new Set(permissionsState.map((permission) => permission.name.split(' ').slice(1).join(' ')))];
        return uniquePermissions.map((section) => {
            const sectionPermissions = permissionsState.filter((permission) => permission.name.split(' ').slice(1).join(' ') == section);
            return {
                label: section,
                icon: getFeatureSectionIcon(section),
                permissions: sectionPermissions.map((permission) => ({
                    value: permission.id.toString(),
                    label: permission.name,
                })),
                sectionPermissions,
            };
        });
    }, [permissionsState]);

    return (
        <div className="my-2 col-span-12">
            {featureSections.length === 0 ? (
                <p>No permissions found.</p>
            ) : (
                featureSections.map((section, index: number) => (
                    <div key={section.label} className={`${index != featureSections.length - 1 && 'border-b'}  border-gray/20 py-4 font-montserrat grid grid-cols-12  `}>
                        {/* Section Icon and Title */}
                        <div className="flex items-center col-span-4">
                            <span className="border border-gray-400 rounded-md p-2">
                                <section.icon className="w-6 h-6 text-blue-500" />
                            </span>

                            <div className="flex flex-col">
                                <h4 className="text-sm font-bold ml-2">{section.label} Management</h4>
                                <p className="ml-2 text-xs text-gray mb-2">Manage {section.label.toLowerCase()} related permissions.</p>
                            </div>
                        </div>

                        {/* Buttons Aligned Next to Title */}
                        <div className="flex flex-wrap gap-2 items-center ml-auto col-span-8">
                            {section.sectionPermissions.map((permission: IPermission) => (
                                <Button
                                    key={permission.id}
                                    variant={permissions.includes(permission.id) ? 'filled' : 'outline'}
                                    color="blue"
                                    className="text-xs px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center w-24 justify-center"
                                >
                                    {/* Hidden Icon Placeholder for Consistent Width */}
                                    {permissions.includes(permission.id) && (
                                        <span className={`mr-2 `}>
                                            <IconListCheck />
                                        </span>
                                    )}
                                    {permission.name.split(' ')[0]}
                                </Button>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default PermissionBody;
