import React, { useEffect, useRef } from 'react';
import FormFeedback from './FormFeedback';

interface IFormTextAreaProps extends React.HTMLProps<HTMLTextAreaElement> {
    invalid?: boolean | '';
    variant?: 'filled' | 'unfilled';
    label?: string;
    withAsterisk?: boolean;
    error?: string;
    autofocus?: boolean;
    // Convenience alias for native `cols`
    columns?: number;
    // Auto-resize height to fit content
    autoresize?: boolean;
    // Alias props for Mantine-like API
    autosize?: boolean;
    minRows?: number;
}

function FormTextArea(props: IFormTextAreaProps) {
    const {
        id,
        autofocus,
        disabled,
        value,
        placeholder,
        maxLength,
        className,
        defaultValue,
        name,
        invalid,
        onChange,
        onBlur,
        onFocus,
        required,
        error,
        withAsterisk,
        label,
        variant,
        columns,
        autoresize,
        // aliases
        autosize,
        minRows,
        rows,
        cols,
    } = props as IFormTextAreaProps & { cols?: number };

    const taRef = useRef<HTMLTextAreaElement | null>(null);
    const initialMinHeightRef = useRef<number | null>(null);

    const effectiveAutoresize = Boolean(autoresize ?? autosize);
    const effectiveRows = effectiveAutoresize ? minRows ?? rows ?? 1 : rows ?? minRows;

    const adjustHeight = () => {
        if (!effectiveAutoresize || !taRef.current) return;
        const el = taRef.current;
        // Defer to next frame to avoid doing layout work in input handler sync path
        requestAnimationFrame(() => {
            if (!taRef.current) return;
            const node = taRef.current;
            if (initialMinHeightRef.current == null) {
                initialMinHeightRef.current = node.offsetHeight;
            }
            node.style.height = 'auto';
            const next = Math.max(node.scrollHeight, initialMinHeightRef.current || 0);
            node.style.height = `${next}px`;
        });
    };

    useEffect(() => {
        adjustHeight();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, effectiveAutoresize, minRows, rows]);

    const baseClass = 'form-input placeholder:!font-inter font-medium border-gray bg-green p-3';
    const invalidClass = 'border-danger/60 dark:border-danger/60 text-danger dark:bg-danger/15 placeholder:text-danger focus:border-danger/80 !ring-danger/80 ring-1 ';
    const filledClass = 'p-3 text-gray text-xsm border bg-white border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div>
            {label && (
                <label htmlFor={id} className="text-xsm">
                    {label}
                    {withAsterisk && <span className="text-danger ml-[3px] pt-3 font-bold">*</span>}
                </label>
            )}
            <textarea
                ref={taRef}
                maxLength={maxLength}
                disabled={disabled}
                required={required}
                id={id}
                autoFocus={autofocus}
                defaultValue={defaultValue}
                name={name}
                value={value ?? ''}
                placeholder={placeholder}
                cols={columns ?? cols}
                rows={effectiveRows}
                className={`${className} ${invalid ? invalidClass : 'placeholder:text-white-dark'
                    } ${baseClass} ${variant === 'filled' || disabled
                        ? filledClass
                        : ' bg-gray-100/70 border-none rounded-xl  ring-none focus:ring-primary focus:ring-2 focus:ring-offset-0 !text-ssm font-semibold text-gray-800/90'
                    }`}
                onChange={(e) => {
                    if (effectiveAutoresize) {
                        adjustHeight();
                    }
                    onChange && onChange(e);
                }}
                onBlur={onBlur}
                onFocus={(e) => {
                    if (effectiveAutoresize) {
                        adjustHeight();
                    }
                    onFocus && onFocus(e);
                }}
                style={effectiveAutoresize ? { overflow: 'hidden', resize: 'none' } : undefined}
            />
            {error && <FormFeedback error={error} />}
        </div>
    );
}

export default FormTextArea;
