import { FileMinus, Pin } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

interface Note {
  id: string
  title: string
}

export const ResourceList = () => {
  const pathname = usePathname()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes')
        if (!response.ok) throw new Error('Failed to fetch notes')
        const data = await response.json()
        setNotes(data)
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (pathname.includes('/notebook')) {
      fetchNotes()
    }
  }, [pathname])

  const getListTitle = () => {
    if (pathname.includes('/notebook')) return 'Notes'
    if (pathname.includes('/chat')) return 'Chats'
    if (pathname.includes('/code')) return 'Repositories'
    return 'Resources'
  }

  const renderList = () => {
    if (pathname.includes('/notebook')) {
      return (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div key={note.id} className="flex min-h-6 items-center gap-2">
              <FileMinus className="h-4 w-4" />
              <div className="text-sm font-medium">{note.title}</div>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full w-full rounded-sm border-gray-200 p-2">
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          disabled
          className="w-full border-none bg-transparent shadow-none">
          <Pin />
          {getListTitle()}
        </Button>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          renderList()
        )}
      </div>
    </div>
  )
}
