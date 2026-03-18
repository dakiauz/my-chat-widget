import React from 'react';
import { formatDate, isDateFormat } from '../../utils/utils';
import { isString } from 'formik';

interface IFormShowProps {
    title: string;
    data: string | JSX.Element;
    className?: string;
}
function FormShow({ data, title, className }: IFormShowProps) {
    return (
        <div className={` ${className} col-span-12 lg:col-span-6 md:col-span-6 !mb-0`}>
            <label className="col-span-12 text-xs text-gray-500 opacity-50  mb-0 truncate">{title}</label>
            <h2 className=" col-span-12 text-lg break-words">{isString(data) ? (data == 'null' ? 'n/a' : isDateFormat(data) ? formatDate(data) : data) : data}</h2>
        </div>
    );
}

export default FormShow;
