'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { EllipsisVerticalIcon, FileUp, FileDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const [importConfirmOpen, setImportConfirmOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const exportToMarkdown = async () => {
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document)
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${note?.title || 'notebook'}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to Markdown:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setImportConfirmOpen(true)
    }
  }

  const importFromMarkdownFile = async () => {
    try {
      if (!selectedFile) return

      const text = await selectedFile.text()
      const blocks = await editor.tryParseMarkdownToBlocks(text)
      editor.replaceBlocks(editor.document, blocks)

      const content = JSON.stringify(editor.document)
      onSave(content)

      setImportConfirmOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error importing from Markdown:', error)
    }
  }

  const cancelImport = () => {
    setImportConfirmOpen(false)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex items-center justify-between pb-4">
        <div className="w-10"></div>
        <h1 className="flex-1 text-center text-2xl font-bold">{note?.title || 'Untitled Note'}</h1>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <FileUp className="mr-2 h-4 w-4" />
                Import Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToMarkdown}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".md,.markdown,text/markdown"
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
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

      <div className="mt-4 flex-1 overflow-auto">
        <BlockNoteView editor={editor} theme="light" />
      </div>

      <Dialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Import</DialogTitle>
            <DialogDescription>Import will overwrite all content of the current document. Continue?</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">Selected file: {selectedFile?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelImport}>
              Cancel
            </Button>
            <Button onClick={importFromMarkdownFile}>Confirm Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
