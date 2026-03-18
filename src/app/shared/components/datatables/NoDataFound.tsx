import React from 'react';
import { CrudModalHandles } from '../ui/modals/crud-modal/CrudModal';
import IconPlus from '../../../../_theme/components/Icon/IconPlus';

function NoDataFound({ add, crudModalRef, title }: { add?: () => void; crudModalRef?: React.RefObject<CrudModalHandles>; title: string }) {
    return (
        <div className="w-full h-full min-h-[60vh] flex flex-grow items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 flex items-center justify-center">
                    <IconPlus className="w-8 h-8 text-white-dark dark:text-gray-600" />
                </div>
                <div className="text-center">
                    <p className="text-md font-semibold text-gray-600 dark:text-gray-300">No records found</p>
                    <p className="text-ssm text-gray-600/80 dark:text-gray-400">Create a {title.toLowerCase()} to display it here.</p>
                </div>
                <button
                    onClick={() => {
                        if (add) add();
                        else if (crudModalRef) crudModalRef.current?.openAdd();
                    }}
                    className="mt-2 bg-primary text-white p-2 rounded-lg text-sm px-8"
                >
                    Create
                </button>
            </div>
        </div>
    );
}

export default NoDataFound;
