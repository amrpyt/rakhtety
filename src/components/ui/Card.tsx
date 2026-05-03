import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

const variantStyles = {
  default: 'bg-[var(--color-surface)] border border-[var(--color-border)]',
  outlined: 'border border-[var(--color-border)]',
  elevated: 'bg-[var(--color-surface)] shadow-[var(--shadow-md)]',
}

export function Card({ variant = 'default', padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] ${variantStyles[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  action?: React.ReactNode
}

export function CardHeader({ children, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`} {...props}>
      <div className="min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <div className={`text-base font-bold ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardSubtitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardSubtitle({ children, className = '', ...props }: CardSubtitleProps) {
  return (
    <div className={`text-xs text-[var(--color-text-muted)] mt-0.5 ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-divider)] ${className}`} {...props}>
      {children}
    </div>
  )
}
