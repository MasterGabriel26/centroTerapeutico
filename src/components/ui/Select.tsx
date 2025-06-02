import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          className={`
            w-full rounded-lg border py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all
            ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-200' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {(helperText || error) && (
          <p
            className={`mt-1 text-sm ${
              error ? 'text-error-600' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
