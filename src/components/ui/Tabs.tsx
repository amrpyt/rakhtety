'use client'

import React, { useState, useCallback } from 'react'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  children?: React.ReactNode
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabClick = useCallback(
    (tabId: string, disabled?: boolean) => {
      if (disabled) return
      setActiveTab(tabId)
      onChange?.(tabId)
    },
    [onChange]
  )

  return (
    <div>
      <div className="mb-4 inline-flex max-w-full flex-wrap gap-2 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/62 p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
              className={`
                min-h-10 rounded-[var(--radius-xl)] px-4 py-2
                text-sm font-bold whitespace-nowrap
                transition-all duration-200
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-text)]'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {tab.icon && <span className="ml-2">{tab.icon}</span>}
              {tab.label}
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}

interface TabPanelProps {
  id: string
  children: React.ReactNode
}

export function TabPanel({ id, children }: TabPanelProps) {
  return <div data-tab-panel={id}>{children}</div>
}
