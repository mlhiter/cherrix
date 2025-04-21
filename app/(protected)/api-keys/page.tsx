'use client'

import { Plus } from 'lucide-react'
import { ApiKey } from '@prisma/client'
import { useState, useEffect } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ApiKeyList } from '@/components/api-keys/api-key-list'
import { ApiKeyForm } from '@/components/api-keys/api-key-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApiKeysPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys')
      if (!response.ok) throw new Error('Failed to fetch API keys')
      const data = await response.json()
      setApiKeys(data.apiKeys)
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>API Keys</CardTitle>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add API Key
          </Button>
        </CardHeader>
        <CardContent>
          <ApiKeyList fetchApiKeys={fetchApiKeys} apiKeys={apiKeys} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
          </DialogHeader>
          <ApiKeyForm
            onSuccess={() => {
              setIsOpen(false)
              fetchApiKeys()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
