'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'

const Editor = dynamic(() => import('../components/editor'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center">Loading editor...</div>,
})

interface Note {
  id: string
  title: string
  content: string
  isPublic: boolean
  collaborators: { id: string }[]
}

interface User {
  id: string
  name: string | null
  image: string | null
}

export default function NotePage() {
  const params = useParams()
  const { data: session } = useSession()
  const noteId = params.noteId as string
  const [note, setNote] = useState<Note | null>(null)
  const [collaborators, setCollaborators] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchNote = useCallback(async () => {
    try {
      const response = await fetch(`/api/note/${noteId}`)
      if (!response.ok) {
        toast.error('Failed to fetch note')
        return
      }
      const data = await response.json()
      setNote(data)
      setCollaborators(data.collaborators || [])
    } catch (error) {
      console.error('Error fetching note:', error)
      setCollaborators([])
    } finally {
      setIsLoading(false)
    }
  }, [noteId])

  const saveNote = useCallback(
    async (content: string) => {
      if (!session?.user || !note) return
      setIsSaving(true)
      try {
        const response = await fetch(`/api/note/${note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            title: note.title,
            isPublic: note.isPublic,
            collaborators: (note.collaborators || []).map((c) => c.id),
          }),
        })
        if (!response.ok) {
          throw new Error('Failed to save note')
        }
      } catch (error) {
        console.error('Error saving note:', error)
        toast.error('Save failed, please try again')
      } finally {
        setIsSaving(false)
      }
    },
    [session?.user, note]
  )

  useEffect(() => {
    if (noteId) {
      fetchNote()
    }
  }, [noteId, fetchNote])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!note) {
    return <div className="flex h-full w-full items-center justify-center">Note not found</div>
  }

  return (
    <div className="h-full flex-1 overflow-hidden">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex flex-col items-center justify-between pb-4">
          <h1 className="text-center text-2xl font-bold">{note?.title || 'Untitled Note'}</h1>
          <div className="mt-2 flex items-center gap-2">
            {(collaborators || []).map((user) => (
              <div key={user.id} className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    className="h-6 w-6 rounded-full"
                    width={24}
                    height={24}
                  />
                )}
                <span className="text-sm text-gray-600">{user.name || 'Anonymous'}</span>
              </div>
            ))}
          </div>
        </div>
        <Editor note={note} collaborators={collaborators} isSaving={isSaving} onSaveAction={saveNote} />
      </div>
    </div>
  )
}
