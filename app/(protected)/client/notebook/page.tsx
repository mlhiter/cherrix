'use client'

import { toast } from 'sonner'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Editor } from './components/editor'

export default function NotebookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get('noteId')

  useEffect(() => {
    const initializeNote = async () => {
      if (!noteId) {
        try {
          // First, try to get existing notes
          const response = await fetch('/api/notes')

          if (!response.ok) {
            toast.error('Failed to fetch notes')
            return
          }

          const notes = await response.json()

          if (notes && notes.length > 0) {
            // If there are existing notes, redirect to the first one
            router.push(`/client/notebook?noteId=${notes[0].id}`)
          } else {
            // If no notes exist, create a new one
            const createResponse = await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: 'Untitled Note',
                content: JSON.stringify([
                  {
                    type: 'paragraph',
                    content: 'Welcome to your new notebook!',
                  },
                ]),
                isPublic: false,
                collaborators: [],
              }),
            })

            if (!createResponse.ok) {
              toast.error('Failed to create note')
              return
            }

            const data = await createResponse.json()
            router.push(`/client/notebook?noteId=${data.id}`)
          }
        } catch (error) {
          console.error('Error initializing note:', error)
          toast.error('Failed to initialize note')
        }
      }
    }

    initializeNote()
  }, [noteId, router])

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-center text-2xl font-bold">
        Notebook
      </div>
      <div className="flex-1">
        <Editor />
      </div>
    </div>
  )
}
