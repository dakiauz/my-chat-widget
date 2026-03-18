import { FC } from 'react';
import IconUser from '../../../../../../_theme/components/Icon/IconUser';
import IconEdit from '../../../../../../_theme/components/Icon/IconEdit';

interface ModalHeaderProps {
    title: string;
}

function ModalHeader({ title }: ModalHeaderProps): ReturnType<FC> {
    return (
        <div className="p-6 pb-0 font-semibold text-lg flex gap-4 items-center">
            <IconEdit className="text-primary h-6 w-6" />
            {title}
        </div>
    );
}

export default ModalHeader;

{
    /* <div className="rounded-lg font-inter text-md font-semibold bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{title}</div>; */
}
