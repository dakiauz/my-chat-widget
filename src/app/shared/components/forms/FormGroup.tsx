import React from 'react';

interface IFormGroupProps extends React.HTMLProps<HTMLDivElement> {}
function FormGroup(props: IFormGroupProps) {
    const { children, className } = props;
    return <div className={` ${className} w-[100%] mb-5 flex flex-col`}>{children}</div>;
}

export default FormGroup;
