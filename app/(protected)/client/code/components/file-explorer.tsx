'use client'

import { WebContainer } from '@webcontainer/api'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import { useFileSystemStore } from '@/stores/file-system'

interface FileExplorerProps {
  webcontainerInstance: WebContainer | null
  onFileSelectAction: (path: string) => void
}

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  isOpen?: boolean
}

export function FileExplorer({
  webcontainerInstance,
  onFileSelectAction,
}: FileExplorerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(['.'])
  )
  const { files, isLoading, error, buildFileTree } = useFileSystemStore()

  useEffect(() => {
    if (webcontainerInstance) {
      buildFileTree(webcontainerInstance)
    }
  }, [webcontainerInstance])

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

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedPaths.has(node.path)
    const indent = level * 16

    return (
      <div key={node.path}>
        <div
          className="flex cursor-pointer items-center gap-1 py-1 hover:bg-gray-100"
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
          <span className="text-sm">{node.name}</span>
        </div>
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-2 rounded-md rounded-b-none border-b border-gray-200 bg-gray-100 p-2 text-sm font-medium">
        File Explorer
      </div>
      {isLoading ? (
        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-4 text-center text-sm text-red-500">{error}</div>
      ) : (
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2">
          {files.map((node) => renderNode(node))}
        </div>
      )}
    </div>
  )
}
