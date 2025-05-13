import { create } from 'zustand'

export interface CodeFile {
  path: string
  content: string
}

interface CodeStore {
  files: CodeFile[]
  setFiles: (files: CodeFile[]) => void
  clearFiles: () => void
}

export const useCodeStore = create<CodeStore>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  clearFiles: () => set({ files: [] }),
}))
