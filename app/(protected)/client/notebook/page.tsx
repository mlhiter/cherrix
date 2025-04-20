'use client'

import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NotebookPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeNote = async () => {
      try {
        setIsLoading(true)
        // First, try to get existing notes
        const response = await fetch('/api/notes')

        if (!response.ok) {
          toast.error('Failed to fetch notes')
          return
        }

        const notes = await response.json()

        if (notes && notes.length > 0) {
          // If there are existing notes, redirect to the first one
          router.push(`/client/notebook/${notes[0].id}`)
        } else {
          // If no notes exist, create a new one
          const createResponse = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Untitled Note',
              content: [
                {
                  type: 'paragraph',
                  content: 'Welcome to your new notebook!',
                },
              ],
              isPublic: false,
              collaborators: [],
            }),
          })

          if (!createResponse.ok) {
            toast.error('Failed to create note')
            return
          }

          const data = await createResponse.json()
          window.dispatchEvent(
            new CustomEvent('resource-updated', { detail: { type: 'note' } })
          )
          router.push(`/client/notebook/${data.id}`)
        }
      } catch (error) {
        console.error('Error initializing note:', error)
        toast.error('Failed to initialize note')
      } finally {
        setIsLoading(false)
      }
    }

    initializeNote()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading notebook...</p>
        </div>
      </div>
    )
  }

  return <div />
}
