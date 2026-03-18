import { FC } from 'react';

interface IModalBodyProps {
    children: JSX.Element;
    className?: string;
}

function ModalBody({ children, className }: IModalBodyProps): ReturnType<FC> {
    return (
        // <ScrollArea className="max-h-[80vh] min-h min-h-[200px]  mr-2 ">
        <div className={`p-6 ${className}`}>{children}</div>
        // </ScrollArea>
    );
}

export default ModalBody;
