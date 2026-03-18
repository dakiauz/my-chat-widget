import { Menu } from '@mantine/core';
import { ReactNode } from 'react';
import IconEye from '../../../../../_theme/components/Icon/IconEye';
import IconPencil from '../../../../../_theme/components/Icon/IconPencil';
import IconTrash from '../../../../../_theme/components/Icon/IconTrash';

interface IMenuActionProps {
    view: () => void;
    edit: () => void;
    remove: () => void;
    editPermission: boolean;
    deletePermission: boolean;
    additionalItems?: ReactNode;
}

function ActionMenu({ view, edit, remove, editPermission, deletePermission, additionalItems }: IMenuActionProps) {
    return (
        <Menu shadow="md" width={140}>
            <Menu.Target>
                <button onClick={(e) => e.stopPropagation()} className="btn p-2 shadow-none border-0 hover:bg-white-light focus:bg-white-light opacity-80">
                    <svg width={22} className="eUuXwBkW5W4__eatjSfd RRXFBumaW2SHdseZaWm6" aria-hidden="true" fill="#000" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    </svg>
                </button>
            </Menu.Target>

            <Menu.Dropdown>
                {/* View option */}
                <Menu.Item
                    onClick={(e) => {
                        e.stopPropagation();
                        view();
                    }}
                    icon={<IconEye />}
                >
                    View
                </Menu.Item>

                {/* Edit option (visible only if editPermission is true) */}
                {editPermission && (
                    <Menu.Item
                        disabled={!editPermission}
                        onClick={(e) => {
                            e.stopPropagation();
                            edit();
                        }}
                        icon={<IconPencil />}
                    >
                        Edit
                    </Menu.Item>
                )}

                {/* Additional menu items */}
                {additionalItems}

                {/* Delete option (visible only if deletePermission is true) */}
                {deletePermission && (
                    <Menu.Item
                        disabled={!deletePermission}
                        onClick={(e) => {
                            e.stopPropagation();
                            remove();
                        }}
                        color="red"
                        icon={<IconTrash />}
                    >
                        Delete
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}

export default ActionMenu;
