import React, { useState, useCallback, useEffect } from 'react'

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
  const isControlled = props.value !== undefined
  const [internalValue, setInternalValue] = useState('')
  const value = isControlled ? String(props.value ?? '') : internalValue

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onSearch?.(newValue)
    },
    [isControlled, onSearch]
  )

  useEffect(() => {
    if (!onDebouncedSearch) return

    const timeoutId = window.setTimeout(() => {
      onDebouncedSearch(value)
    }, debounceMs)

    return () => window.clearTimeout(timeoutId)
  }, [debounceMs, onDebouncedSearch, value])

  return (
    <div
      className={`
        relative flex min-h-11 min-w-0 items-center gap-2
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
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
        value={value}
        onChange={handleChange}
        {...props}
      />
      {value && (
        <button
          onClick={() => {
            if (!isControlled) {
              setInternalValue('')
            }
            onSearch?.('')
            onDebouncedSearch?.('')
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          type="button"
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
