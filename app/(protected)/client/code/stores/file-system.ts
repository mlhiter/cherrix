import { create } from 'zustand'
import { WebContainer } from '@webcontainer/api'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

interface FileSystemState {
  files: FileNode[]
  currentFile: string
  fileContent: string
  isLoading: boolean
  error: string | null
  buildFileTree: (webcontainerInstance: WebContainer | null) => Promise<void>
  loadFile: (
    webcontainerInstance: WebContainer | null,
    path: string
  ) => Promise<void>
  saveFile: (
    webcontainerInstance: WebContainer | null,
    content: string
  ) => Promise<void>
}

const buildFileTree = async (
  path: string = '.',
  webcontainerInstance: WebContainer | null
): Promise<FileNode[]> => {
  if (!webcontainerInstance) return []

  try {
    const entries = await webcontainerInstance.fs.readdir(path, {
      withFileTypes: true,
    })
    const nodes: FileNode[] = []

    for (const entry of entries) {
      const fullPath = path === '.' ? entry.name : `${path}/${entry.name}`

      const node: FileNode = {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'directory' : 'file',
      }

      if (entry.isDirectory()) {
        try {
          node.children = await buildFileTree(fullPath, webcontainerInstance)
        } catch (err) {
          console.error(`Failed to read directory ${fullPath}:`, err)
          node.children = []
        }
      }

      nodes.push(node)
    }

    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })
  } catch (error) {
    console.error('Read directory failed:', error)
    throw error
  }
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  files: [],
  currentFile: '',
  fileContent: '',
  isLoading: false,
  error: null,

  buildFileTree: async (webcontainerInstance) => {
    set({ isLoading: true, error: null })
    try {
      const files = await buildFileTree('.', webcontainerInstance)
      set({ files, error: null })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  },

  loadFile: async (webcontainerInstance, path) => {
    if (!webcontainerInstance) return

    set({ isLoading: true, error: null })
    try {
      const content = await webcontainerInstance.fs.readFile(path, 'utf-8')
      set({ currentFile: path, fileContent: content, error: null })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  },

  saveFile: async (webcontainerInstance, content) => {
    const { currentFile } = get()
    if (!webcontainerInstance || !currentFile) return

    set({ isLoading: true, error: null })
    try {
      await webcontainerInstance.fs.writeFile(currentFile, content)
      set({ fileContent: content, error: null })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  },
}))
