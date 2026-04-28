import React from 'react'

interface FormGroupProps {
  children: React.ReactNode
  className?: string
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return <div className={`flex flex-col gap-1.5 ${className}`}>{children}</div>
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`text-sm font-medium text-[var(--color-text-muted)] ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, helperText, className = '', ...props }, ref) => {
    return (
      <>
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-surface)]
            text-[var(--color-text)]
            text-sm
            placeholder:text-[var(--color-text-faint)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : ''}
            ${className}
          `.trim()}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-error)] mt-1">{error}</span>}
        {helperText && !error && <span className="text-xs text-[var(--color-text-muted)] mt-1">{helperText}</span>}
      </>
    )
  }
)

Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <>
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-surface)]
            text-[var(--color-text)]
            text-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : ''}
            ${className}
          `.trim()}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[var(--color-error)] mt-1">{error}</span>}
      </>
    )
  }
)

Select.displayName = 'Select'