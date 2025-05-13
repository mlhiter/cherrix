'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'

import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'

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

interface EditorProps {
  note: Note
  collaborators: User[]
  isSaving: boolean
  onSaveAction: (content: string) => Promise<void>
}

export default function Editor({ note, collaborators, isSaving, onSaveAction: onSave }: EditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/note/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      return data.url
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload file')
    }
  }

  const editor = useCreateBlockNote({
    initialContent: note?.content
      ? (JSON.parse(note.content) as PartialBlock[])
      : ([
          {
            type: 'paragraph',
            content: 'Welcome to your new notebook!',
          },
        ] as PartialBlock[]),
    uploadFile: handleFileUpload,
  }) as BlockNoteEditor

  useEffect(() => {
    const handleChange = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        const content = JSON.stringify(editor.document)
        onSave(content)
      }, 1000)
    }

    editor.domElement?.addEventListener('input', handleChange)
    return () => {
      editor.domElement?.removeEventListener('input', handleChange)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [editor, onSave])

  useEffect(() => {
    const handleBeforeUnload = () => {
      const content = JSON.stringify(editor.document)
      onSave(content)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [editor, onSave])

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{note?.title || 'Untitled Note'}</h1>
          <div className="flex items-center gap-2">
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
        {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
      </div>
      <div className="flex-1">
        <BlockNoteView editor={editor} theme="light" />
      </div>
    </div>
  )
}
