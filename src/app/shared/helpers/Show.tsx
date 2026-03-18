import React, { FC } from 'react';
interface IShowProps {
    show: JSX.Element | JSX.Element[];
    when: boolean;
    or?: JSX.Element | JSX.Element[] | null | undefined;
}
function Show(props: IShowProps): ReturnType<FC> {
    const { show, when, or } = props;
    return <>{when ? show : or}</>;
}

export default Show;
