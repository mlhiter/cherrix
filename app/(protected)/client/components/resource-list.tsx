import { Pin, Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResourceItem } from './resource-item'
import { initialMessages } from '@/constants/chat'

interface Resource {
  id: string
  title: string
}

type ResourceType = 'note' | 'chat'

const useResources = (type: ResourceType) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const endpoint = type === 'note' ? '/api/notes' : '/api/chats'
        const response = await fetch(endpoint)
        if (!response.ok) throw new Error(`Failed to fetch ${type}s`)
        const data = await response.json()
        setResources(data)
      } catch (error) {
        console.error(`Error fetching ${type}s:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()

    const handleResourceUpdate = (event: CustomEvent) => {
      if (event.detail.type === type) {
        fetchResources()
      }
    }

    window.addEventListener('resource-updated', handleResourceUpdate as EventListener)
    return () => {
      window.removeEventListener('resource-updated', handleResourceUpdate as EventListener)
    }
  }, [type])

  const handleDelete = async (id: string) => {
    try {
      const endpoint = type === 'note' ? '/api/notes' : '/api/chats'
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error(`Failed to delete ${type}`)
      setResources(resources.filter((resource) => resource.id !== id))

      // Check if we're currently viewing the deleted resource
      const currentPath = window.location.pathname
      if (currentPath.includes(`/${id}`)) {
        const basePath = type === 'note' ? '/client/notebook' : '/client/chat'
        router.push(basePath)
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
    }
  }

  const handleCreate = async (title: string) => {
    try {
      const endpoint = type === 'note' ? '/api/notes' : '/api/chats'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          ...(type === 'note' && {
            content: [
              {
                type: 'paragraph',
                content: 'Welcome to your new notebook!',
              },
            ],
          }),
          ...(type === 'chat' && {
            messages: initialMessages,
          }),
        }),
      })
      if (!response.ok) throw new Error(`Failed to create ${type}`)
      const newResource = await response.json()
      setResources([...resources, newResource])
      return newResource
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      return null
    }
  }

  const handleRename = async (id: string, newTitle: string) => {
    try {
      const endpoint = type === 'note' ? '/api/notes' : '/api/chats'
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })
      if (!response.ok) throw new Error(`Failed to rename ${type}`)
      setResources(resources.map((resource) => (resource.id === id ? { ...resource, title: newTitle } : resource)))
    } catch (error) {
      console.error(`Error renaming ${type}:`, error)
    }
  }

  return {
    resources,
    isLoading,
    handleDelete,
    handleCreate,
    handleRename,
  }
}

export const ResourceList = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const resourceType: ResourceType = pathname.includes('/notebook') ? 'note' : 'chat'
  const { resources, isLoading, handleDelete, handleCreate, handleRename } = useResources(resourceType)

  const getListTitle = () => {
    if (pathname.includes('/notebook')) return 'Notes'
    if (pathname.includes('/chat')) return 'Chats'
    if (pathname.includes('/code')) return 'Repositories'
    return 'Resources'
  }

  const handleCreateSubmit = async () => {
    if (!newTitle.trim()) return
    const newResource = await handleCreate(newTitle)
    if (newResource) {
      setNewTitle('')
      setIsCreating(false)
      const basePath = resourceType === 'note' ? '/client/notebook' : '/client/chat'
      router.push(`${basePath}/${newResource.id}`)
    }
  }

  return (
    <div className="h-full w-full rounded-sm border-gray-200 p-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled className="border-none bg-transparent shadow-none">
            <Pin className="mr-2 h-4 w-4" />
            {getListTitle()}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isCreating && (
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter title..."
              className="h-8"
            />
            <Button variant="outline" className="h-8" onClick={handleCreateSubmit}>
              Create
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {resources.map((resource) => (
              <ResourceItem
                key={resource.id}
                item={resource}
                type={resourceType}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
