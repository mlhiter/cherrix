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
    <div className="flex-1 overflow-auto">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  )
}
