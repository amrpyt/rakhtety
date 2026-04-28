import React from 'react'

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Table({ children, className = '', ...props }: TableProps) {
  return (
    <div
      className={`overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] ${className}`}
      {...props}
    >
      <table className="w-full">{children}</table>
    </div>
  )
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export function TableHead({ children, className = '', ...props }: TableHeadProps) {
  return (
    <thead className={`bg-[var(--color-surface-offset)] ${className}`} {...props}>
      {children}
    </thead>
  )
}

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export function TableHeader({ children, className = '', ...props }: TableHeaderProps) {
  return (
    <th
      className={`
        px-4 py-3 text-right text-xs font-bold uppercase tracking-wider
        text-[var(--color-text-muted)]
        whitespace-nowrap
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </th>
  )
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export function TableBody({ children, className = '', ...props }: TableBodyProps) {
  return <tbody className={className} {...props}>{children}</tbody>
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  onClick?: () => void
}

export function TableRow({ children, onClick, className = '', ...props }: TableRowProps) {
  return (
    <tr
      className={`
        border-t border-[var(--color-border)]
        ${onClick ? 'cursor-pointer hover:bg-[var(--color-surface-offset)]' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  )
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} {...props}>
      {children}
    </td>
  )
}