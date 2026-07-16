import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[] | { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 w-full rounded-lg border border-input bg-card text-card-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer ${className}`}
        ref={ref}
        {...props}
      >
        {options.map((opt, i) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={i} value={value} className="bg-card text-card-foreground">
              {label}
            </option>
          );
        })}
      </select>
    );
  }
);

Select.displayName = 'Select';
