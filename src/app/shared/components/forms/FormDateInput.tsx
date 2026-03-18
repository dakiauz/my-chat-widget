import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FormFeedback from './FormFeedback';

interface IFormInputProps extends React.HTMLProps<HTMLInputElement> {
    invalid?: boolean | '';
    variant?: 'filled' | 'unfilled';
    label?: string;
    withAsterisk?: boolean;
    error?: string;
    autofocus?: boolean;
}

interface IDateInputProps extends IFormInputProps {
    selectedDate: string | null;
    onDateChange: (date: string | null) => void;
}

const FormDateInput: React.FC<IDateInputProps> = (props) => {
    const { id, autofocus, disabled, selectedDate, placeholder, className, name, invalid, onBlur, onFocus, required, error, label, withAsterisk, onDateChange } = props;

    const handleDatePickerChange = (date: Date | null) => {
        if (date) {
            const formattedDate = formatDate(date);
            onDateChange(formattedDate);
        } else {
            onDateChange(null);
        }
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <>
            {label && (
                <label htmlFor={id} className="text-sm font-semibold">
                    {label}
                    {withAsterisk && <span className="text-danger ml-[3px] font-bold">*</span>}
                </label>
            )}
            <DatePicker
                id={id}
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={handleDatePickerChange}
                onBlur={onBlur}
                onFocus={onFocus}
                placeholderText={placeholder}
                dateFormat="yyyy-MM-dd"
                className={`form-input ${className} ${
                    invalid ? 'border-danger/60 dark:border-danger/60 text-danger dark:bg-danger/15 placeholder:text-danger focus:border-danger/80' : 'placeholder:text-white-dark'
                } ${props.variant === 'filled' || disabled ? 'bg-white-light/20 focus:bg-white-light/30 outline-none border-none text-white-dark' : ''}`}
                required={required}
                autoFocus={autofocus}
                disabled={disabled}
                name={name}
            />
            {error && <FormFeedback error={error} />}
        </>
    );
};

export default FormDateInput;
