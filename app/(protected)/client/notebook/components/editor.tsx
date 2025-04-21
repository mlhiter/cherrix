'use client'

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

  const editor = useCreateBlockNote({
    initialContent: note?.content
      ? (JSON.parse(note.content) as PartialBlock[])
      : ([
          {
            type: 'paragraph',
            content: 'Welcome to your new notebook!',
          },
        ] as PartialBlock[]),
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
                {user.image && <img src={user.image} alt={user.name || 'User'} className="h-6 w-6 rounded-full" />}
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
