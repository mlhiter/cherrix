'use client'

import { useState } from 'react'
import { ApiKey } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Edit, Trash } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ApiKeyForm } from './api-key-form'

type ApiKeyListProps = {
  apiKeys: ApiKey[]
  isLoading: boolean
  fetchApiKeys: () => void
}

export function ApiKeyList({ apiKeys, isLoading, fetchApiKeys }: ApiKeyListProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!apiKeys.length) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No API keys found</p>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }

      fetchApiKeys()
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update API key')
      }

      fetchApiKeys()
    } catch (error) {
      console.error('Failed to update API key:', error)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Base URL</TableHead>
            <TableHead>Model ID</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>{key.name}</TableCell>
              <TableCell>{key.baseUrl}</TableCell>
              <TableCell>{key.modelId}</TableCell>
              <TableCell>
                <Switch checked={key.isActive} onCheckedChange={(checked) => handleToggleActive(key.id, checked)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingKey(key.id)
                      setIsOpen(true)
                    }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
          </DialogHeader>
          {editingKey && (
            <ApiKeyForm
              isEditing={true}
              defaultValues={apiKeys.find((key) => key.id === editingKey)}
              onSuccess={() => {
                setIsOpen(false)
                setEditingKey(null)
                fetchApiKeys()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
