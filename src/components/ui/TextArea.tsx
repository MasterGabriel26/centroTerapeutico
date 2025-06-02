import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    label,
    helperText,
    error,
    containerClassName = '',
    className = '',
    ...props
  }, ref) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={`
            w-full rounded-lg border focus:outline-none focus:ring-2 transition-all
            ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-200' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'}
            py-2 px-3 text-gray-900 resize-none
            ${className}
          `}
          {...props}
        />
        
        {(helperText || error) && (
          <p className={`mt-1 text-sm ${error ? 'text-error-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
