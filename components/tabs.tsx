import { cn } from '@/lib/utils'

interface TabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  tabList: {
    label: string
    value: string
    icon: React.ReactNode
  }[]
}

export const Tabs = ({ activeTab, setActiveTab, tabList }: TabsProps) => {
  return (
    <div className="flex border-b">
      {tabList.map((tab) => (
        <button
          key={tab.value}
          className={cn(
            'flex items-center px-4 py-2',
            activeTab === tab.value && 'border-b-2 border-primary font-medium'
          )}
          onClick={() => setActiveTab(tab.value)}>
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
