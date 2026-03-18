import React from 'react';
import IconDollarSign from '../../../../_theme/components/Icon/IconDollarSign';
import { formatCurrency } from '../../utils/utils';
import FormFeedback from './FormFeedback';

interface IFormInputProps extends React.HTMLProps<HTMLInputElement> {
    invalid?: boolean | '';
    variant?: 'filled' | 'unfilled';
    label?: string;
    withAsterisk?: boolean;
    error?: string | false;
    autofocus?: boolean;
    currencySymbol?: string;
}

const FormInput: React.FC<IFormInputProps> = ({
    id,
    autofocus,
    disabled,
    value,
    type,
    currencySymbol,
    placeholder,
    className,
    defaultValue,
    name,
    invalid,
    onChange,
    onBlur,
    onFocus,
    required,
    error,
    label,
    withAsterisk,
    variant = 'unfilled',
    ...props
}) => {
    const baseClass = 'form-input placeholder:!font-inter font-medium border-gray bg-green p-3';
    const invalidClass = 'border-danger/60 dark:border-danger/60 text-danger dark:bg-danger/15 placeholder:text-danger focus:border-danger/80 ';
    const filledClass = 'p-3 text-gray text-xsm border bg-white border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div>
            {label && (
                <label htmlFor={id} className="text-xsm">
                    {label}
                    {withAsterisk && <span className="text-danger ml-[3px] pt-3 font-bold">*</span>}
                </label>
            )}
            {type === 'currency' ? (
                <div
                    className={`flex flex-row items-center ${className} ${invalid ? invalidClass : 'placeholder:text-white-dark'} ${baseClass} pl-0 py-0 pr-0 ${
                        variant === 'filled' || disabled ? filledClass : ''
                    }`}
                >
                    <div className="p-2 py-3 flex items-center justify-center h-full">
                        <h3 className="text-sm font-semibold">{currencySymbol && currencySymbol != '$' ? currencySymbol : <IconDollarSign className="w-[14px] h-[14px]" />}</h3>
                    </div>
                    <input
                        className="w-full px-3 border border-gray h-full rounded-lg"
                        disabled={disabled}
                        required={required}
                        id={id}
                        autoFocus={autofocus}
                        defaultValue={defaultValue}
                        type="text"
                        name={name}
                        value={formatCurrency(value + '')}
                        placeholder={placeholder}
                        onChange={onChange}
                        onBlur={onBlur}
                        onFocus={onFocus}
                    />
                </div>
            ) : (
                <input
                    disabled={disabled}
                    required={required}
                    id={id}
                    autoFocus={autofocus}
                    defaultValue={defaultValue}
                    type={type}
                    name={name}
                    value={value ?? ''}
                    placeholder={placeholder}
                    className={`${className} ${
                        invalid
                            ? 'border-danger/60 dark:border-danger/60 text-danger dark:bg-danger/15 placeholder:text-danger focus:border-danger/80 !ring-danger/80 ring-1 '
                            : 'placeholder:text-white-dark'
                    } ${baseClass} ${
                        variant === 'filled' || disabled
                            ? filledClass
                            : ' bg-gray-100/70 border-none rounded-xl  ring-none focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90'
                    }`}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    {...props}
                />
            )}
            {error && <FormFeedback error={error} />}
        </div>
    );
};

export default FormInput;
