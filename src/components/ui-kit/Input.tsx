import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const inputClasses = `
      block w-full
      px-4 py-4
      text-base
      border border-gray-300
      rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      placeholder-gray-400
      min-h-[44px]
      ${error ? 'border-error-500 focus:ring-error-500' : ''}
      ${className || ''}
    `.trim();

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}
                <input id={id} className={inputClasses} ref={ref} {...props} />
                {error && <p className="text-sm text-error-500">{error}</p>}
            </div>
        );
    }
);
