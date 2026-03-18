import React from 'react';

interface IFormLabelProps extends React.HTMLProps<HTMLLabelElement> {
    editable?: boolean;
    value?: string;
    name?: string;
    onChangeData?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | false;
}

function FormLabel(props: IFormLabelProps) {
    const { htmlFor, children, className, required, editable, onChangeData, value, name, error } = props;
    return (
        <>
            {editable ? (
                <input
                    name={name}
                    autoFocus
                    type="text"
                    className={`${className} block text-black text-xsm font-medium mb-2`}
                    value={value}
                    onChange={(e) => {
                        if (onChangeData) onChangeData(e);
                    }}
                />
            ) : (
                <>
                    {error && error != 'null' ? (
                        <div className="flex justify-between flex-wrap">
                            <label className={`${className} text-ssm`} htmlFor={htmlFor}>
                                {children}
                                {required && <span className="text-danger ml-[2px]">*</span>}
                            </label>
                            <div className="text-danger mt-1 ps-1">{error}</div>
                        </div>
                    ) : (
                        <label className={`${className} text-ssm text-gray-600`} htmlFor={htmlFor}>
                            {children}
                            {required && <span className="text-danger ml-[2px]">*</span>}
                        </label>
                    )}
                </>
            )}
        </>
    );
}

export default FormLabel;
