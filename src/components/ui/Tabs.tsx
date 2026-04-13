import { useState, ReactNode, Children, isValidElement } from 'react'
import './Tabs.css'

interface TabProps {
  value: string
  label: string
  children?: ReactNode
}

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export const Tabs = ({ defaultValue, value, onValueChange, children }: TabsProps) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue || '')

  const handleTabChange = (tabValue: string) => {
    if (onValueChange) {
      onValueChange(tabValue)
    } else {
      setSelectedTab(tabValue)
    }
  }

  const currentValue = value !== undefined ? value : selectedTab

  const tabs = Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> => 
      isValidElement(child) && typeof child.type !== 'string' && child.props.label
  )

  return (
    <div className="tabs">
      <div className="tabs-list">
        {tabs.map((tab, index) => {
          const tabValue = (tab as React.ReactElement<TabProps>).props.value || `tab-${index}`
          const isSelected = currentValue === tabValue
          
          return (
            <button
              key={tabValue}
              className={`tabs-trigger ${isSelected ? 'tabs-trigger--active' : ''}`}
              onClick={() => handleTabChange(tabValue)}
            >
              {(tab as React.ReactElement<TabProps>).props.label}
            </button>
          )
        })}
      </div>
      <div className="tabs-content">
        {tabs.map((tab, index) => {
          const tabValue = (tab as React.ReactElement<TabProps>).props.value || `tab-${index}`
          return currentValue === tabValue ? (
            <div key={tabValue} className="tabs-panel">
              {(tab as React.ReactElement<TabProps>).props.children}
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}

export const Tab = ({ children }: TabProps) => {
  return <>{children}</>
}