import { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useState } from 'react';
import Show from '../../../../helpers/Show';
import { IModalSize } from '../modal/Modal';
import ModalWrapper from './ModalWrapper';

interface ICrudModalProps {
    opened: boolean;
    open: () => void;
    close: () => void;
    title: string;
    AddBody: JSX.Element;
    EditBody?: JSX.Element;
    DeleteBody: JSX.Element;
    PermissionBody?: JSX.Element;
    size?: IModalSize;
}

export interface CrudModalHandles {
    openEdit: () => void;
    openAdd: () => void;
    openDelete: () => void;
    openPermission: () => void;
}

const CrudModal: ForwardRefRenderFunction<CrudModalHandles, ICrudModalProps> = ({ open, opened, close, title, AddBody, EditBody, DeleteBody, PermissionBody, size }, ref) => {
    const [editAction, setEditAction] = useState(false);
    const [addAction, setAddAction] = useState(false);
    const [deleteAction, setDeleteAction] = useState(false);
    const [permissionAction, setPermissionAction] = useState(false);

    useImperativeHandle(ref, () => ({
        openEdit: () => {
            open();
            setEditAction(true);
            setAddAction(false);
            setDeleteAction(false);
            setPermissionAction(false);
        },
        openAdd: () => {
            open();
            setAddAction(true);
            setEditAction(false);
            setDeleteAction(false);
            setPermissionAction(false);
        },
        openDelete: () => {
            open();
            setDeleteAction(true);
            setEditAction(false);
            setAddAction(false);
            setPermissionAction(false);
        },
        openPermission: () => {
            open();
            setPermissionAction(true);
            setEditAction(false);
            setAddAction(false);
            setDeleteAction(false);
        },
    }));

    return (
        <ModalWrapper
            size={permissionAction || addAction || editAction ? 'max-w-2xl' : size} // Add Role case handled
            isOpen={opened}
            close={close}
            headerTitle={editAction ? `Edit ${title} ` : addAction ? `Add ${title}` : permissionAction ? 'Permission' : null}
            body={
                <Show
                    when={editAction}
                    show={EditBody ?? <></>}
                    or={<Show show={DeleteBody} when={deleteAction} or={<Show show={AddBody} when={addAction} or={<Show show={PermissionBody ?? <></>} when={permissionAction} />} />} />}
                />
            }
        />
    );
};

export default forwardRef(CrudModal);
