import React, { PropsWithChildren } from 'react';
function FormFeedback(props: { error?: string | false; className?: string }) {
    const { error, className } = props;
    return <>{error && <div className={`${className} text-red-500 text-xs mx-1 mt-2 `}>{error}</div>}</>;
}

export default FormFeedback;
