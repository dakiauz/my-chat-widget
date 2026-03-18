import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export interface IBreadCrumbType {
    label: string;
    link?: string;
    linkLabel?: string;
}

function BreadCrumbs(props: IBreadCrumbType): ReturnType<FC> {
    const { label, link, linkLabel } = props;
    return (
        <ul className="flex space-x-2 rtl:space-x-reverse mb-4">
            {linkLabel && (
                <li>
                    <Link to={link ?? '#'} className="text-primary hover:underline dark:text-white">
                        {linkLabel}
                    </Link>
                </li>
            )}
            <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                <span>{label}</span>
            </li>
        </ul>
    );
}

export default BreadCrumbs;
