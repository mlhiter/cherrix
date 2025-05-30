'use client'

import { WebContainer } from '@webcontainer/api'
import { useEffect, useState, useRef } from 'react'
import { ChevronDown, ChevronRight, File, Folder, Plus, Trash2, FolderPlus, FilePlus, Pencil } from 'lucide-react'
import { useFileSystemStore } from '@/stores/file-system'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface FileExplorerProps {
  webcontainerInstance: WebContainer | null
  onFileSelectAction: (path: string) => void
  currentFilePath?: string
}

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  isOpen?: boolean
  isNew?: boolean
}

export function FileExplorer({ webcontainerInstance, onFileSelectAction, currentFilePath }: FileExplorerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['.']))
  const [newFileName, setNewFileName] = useState<string>('')
  const [creatingPath, setCreatingPath] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { files, isLoading, error, buildFileTree } = useFileSystemStore()

  useEffect(() => {
    if (webcontainerInstance) {
      buildFileTree(webcontainerInstance)
    }
  }, [webcontainerInstance])

  useEffect(() => {
    if ((creatingPath || renamingPath) && inputRef.current) {
      inputRef.current.focus()
    }
  }, [creatingPath, renamingPath])

  // 当有当前文件时，自动展开其父目录
  useEffect(() => {
    if (currentFilePath) {
      const pathParts = currentFilePath.split('/')
      let currentPath = ''
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i]
        setExpandedPaths((prev) => new Set([...prev, currentPath]))
      }
    }
  }, [currentFilePath])

  const toggleDirectory = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const handleCreateFile = async (path: string) => {
    setCreatingPath(path)
    setNewFileName('')
    setIsCreatingFolder(false)
    if (!expandedPaths.has(path)) {
      setExpandedPaths((prev) => new Set([...prev, path]))
    }
  }

  const handleCreateFolder = async (path: string) => {
    setCreatingPath(path)
    setNewFileName('')
    setIsCreatingFolder(true)
    if (!expandedPaths.has(path)) {
      setExpandedPaths((prev) => new Set([...prev, path]))
    }
  }

  const handleRename = (path: string, currentName: string) => {
    setRenamingPath(path)
    setNewFileName(currentName)
  }

  const handleNewNameKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
    parentPath: string,
    isRenaming: boolean = false
  ) => {
    if (e.key === 'Enter') {
      if (!webcontainerInstance || !newFileName.trim()) return

      try {
        if (isRenaming) {
          const oldPath = renamingPath!
          const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newFileName.trim()
          await webcontainerInstance.fs.rename(oldPath, newPath)
          toast.success('Renamed successfully')
        } else {
          const fullPath = parentPath === '.' ? newFileName.trim() : `${parentPath}/${newFileName.trim()}`
          if (isCreatingFolder) {
            await webcontainerInstance.fs.mkdir(fullPath)
          } else {
            await webcontainerInstance.fs.writeFile(fullPath, '')
          }
          toast.success(`${isCreatingFolder ? 'Folder' : 'File'} created successfully`)
        }
        await buildFileTree(webcontainerInstance)
        setCreatingPath(null)
        setRenamingPath(null)
        setNewFileName('')
        setIsCreatingFolder(false)
      } catch (error) {
        toast.error(`Failed to ${isRenaming ? 'rename' : 'create'}`)
        console.error(error)
      }
    } else if (e.key === 'Escape') {
      setCreatingPath(null)
      setRenamingPath(null)
      setNewFileName('')
      setIsCreatingFolder(false)
    }
  }

  const handleDeleteFile = async (path: string) => {
    if (!webcontainerInstance) return

    try {
      await webcontainerInstance.fs.rm(path, { recursive: true })
      await buildFileTree(webcontainerInstance)
      toast.success('File deleted successfully')
    } catch (error) {
      toast.error('Failed to delete file')
      console.error(error)
    }
  }

  const renderNewItemInput = (parentPath: string, level: number, isRenaming: boolean = false) => {
    return (
      <div className="flex items-center gap-1 py-1" style={{ paddingLeft: `${level * 16}px` }}>
        {isRenaming ? null : isCreatingFolder ? (
          <Folder className="h-4 w-4 text-blue-500" />
        ) : (
          <File className="h-4 w-4 text-gray-500" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          onKeyDown={(e) => handleNewNameKeyDown(e, parentPath, isRenaming)}
          className="ml-1 h-5 w-full border-none bg-transparent p-0 text-sm outline-none"
          onClick={(e) => e.stopPropagation()}
          placeholder={`Enter ${isRenaming ? 'new name' : isCreatingFolder ? 'folder' : 'file'} name`}
        />
      </div>
    )
  }

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedPaths.has(node.path)
    const indent = level * 16
    const isCurrentFile = node.path === currentFilePath
    const isRenaming = renamingPath === node.path

    return (
      <ContextMenu key={node.path}>
        <ContextMenuTrigger>
          <div
            className={`flex cursor-pointer items-center gap-1 py-1 hover:bg-gray-100 ${
              isCurrentFile ? 'bg-blue-50' : ''
            }`}
            style={{ paddingLeft: `${indent}px` }}
            onClick={() => {
              if (node.type === 'directory') {
                toggleDirectory(node.path)
              } else {
                onFileSelectAction(node.path)
              }
            }}>
            {node.type === 'directory' ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <Folder className="h-4 w-4 text-blue-500" />
              </>
            ) : (
              <File className="h-4 w-4 text-gray-500" />
            )}
            {isRenaming ? renderNewItemInput(node.path, 0, true) : <span className="text-sm">{node.name}</span>}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleRename(node.path, node.name)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          {node.type === 'directory' && (
            <>
              <ContextMenuItem onClick={() => handleCreateFile(node.path)}>
                <FilePlus className="mr-2 h-4 w-4" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCreateFolder(node.path)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={() => handleDeleteFile(node.path)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
        {node.type === 'directory' && isExpanded && (
          <div>
            {node.children?.map((child) => renderNode(child, level + 1))}
            {creatingPath === node.path && renderNewItemInput(node.path, level + 1)}
          </div>
        )}
      </ContextMenu>
    )
  }

  const getCurrentDirectory = () => {
    if (!currentFilePath) return '.'
    const lastSlashIndex = currentFilePath.lastIndexOf('/')
    return lastSlashIndex === -1 ? '.' : currentFilePath.substring(0, lastSlashIndex)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-2 flex items-center justify-between rounded-md rounded-b-none border-b border-gray-200 bg-gray-100 p-2">
        <div className="text-sm font-medium">File Explorer</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCreateFile(getCurrentDirectory())}
            className="h-6 px-2">
            <FilePlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCreateFolder(getCurrentDirectory())}
            className="h-6 px-2">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-4 text-center text-sm text-red-500">{error}</div>
      ) : (
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2">
          {files.map((node) => renderNode(node))}
          {creatingPath === '.' && renderNewItemInput('.', 0)}
        </div>
      )}
    </div>
  )
}
