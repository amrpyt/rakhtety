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
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
              className={`
                px-4 py-2 rounded-[var(--radius-md)]
                text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-divider)]'
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