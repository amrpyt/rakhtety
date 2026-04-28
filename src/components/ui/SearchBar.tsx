import React, { useState, useCallback } from 'react'

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch?: (value: string) => void
  onDebouncedSearch?: (value: string) => void
  debounceMs?: number
}

export function SearchBar({
  onSearch,
  onDebouncedSearch,
  debounceMs = 300,
  className = '',
  ...props
}: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      onSearch?.(newValue)

      if (onDebouncedSearch) {
        const timeoutId = setTimeout(() => {
          onDebouncedSearch(newValue)
        }, debounceMs)
        return () => clearTimeout(timeoutId)
      }
    },
    [onSearch, onDebouncedSearch, debounceMs]
  )

  return (
    <div
      className={`
        relative flex items-center gap-2
        px-3 py-2 rounded-[var(--radius-md)]
        bg-[var(--color-surface-offset)]
        border border-[var(--color-border)]
        focus-within:bg-[var(--color-surface)]
        focus-within:border-[var(--color-primary)]
        focus-within:ring-2 focus-within:ring-[var(--color-primary-light)]
        transition-all duration-150
        ${className}
      `}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]"
        value={value}
        onChange={handleChange}
        {...props}
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            onSearch?.('')
          }}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}