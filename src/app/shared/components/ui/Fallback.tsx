import { Skeleton } from '@mantine/core';
import { FC } from 'react';

interface IFallbackProps {
    title: string;
}

const Fallback: FC<IFallbackProps> = ({ title }) => {
    return (
        <div className="">
            <div className=" p-6 pb-3  flex justify-between items-center">
                <h1 className="font-bold text-lg">{title}</h1>
                <Skeleton height={30} width={'80px'} />
            </div>
            <div className="px-5 py-2">
                <Skeleton className="rounded-none mt-2" height={500} mb="md" />
            </div>

            <div className="flex justify-end mx-3">
                {/* <Skeleton height={40} width={'180px'} /> */}
                <div className="flex gap-1">
                    <Skeleton height={40} circle />
                    <Skeleton height={40} circle />
                    <Skeleton height={40} circle />
                </div>
            </div>
        </div>
    );
};

export default Fallback;
