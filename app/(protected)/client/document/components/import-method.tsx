import { useState } from 'react'

import { Tabs } from '@/components/tabs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const ImportMethod = () => {
  const [activeTab, setActiveTab] = useState('local')

  const Icon = ({ name }: { name: string }) => (
    <span className="mr-2">
      {name === 'local' ? '💾' : name === 'link' ? '🔗' : '📤'}
    </span>
  )
  const tabList = [
    { label: 'Local', value: 'local', icon: <Icon name="local" /> },
    { label: 'URL', value: 'url', icon: <Icon name="link" /> },
    {
      label: 'Third-Party',
      value: 'third-party',
      icon: <Icon name="upload" />,
    },
  ]

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabList={tabList}
        />

        <div className="mt-4">
          {activeTab === 'local' && (
            <div className="flex flex-col gap-4">
              <Button className="w-40">Upload File</Button>
              <p className="text-sm text-muted-foreground">
                Support PDF, Word, Excel, Markdown, TXT.
              </p>
            </div>
          )}
          {activeTab === 'url' && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter document URL"
                  className="w-full"
                />
                <Button>Import</Button>
              </div>
            </div>
          )}
          {activeTab === 'third-party' && (
            <div className="flex gap-4">
              <Button variant="outline">Google Drive</Button>
              <Button variant="outline">Dropbox</Button>
              <Button variant="outline">OneDrive</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
