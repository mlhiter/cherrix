import { create } from 'zustand'

interface CodeStore {
  files: object
  setFiles: (files: object) => void
  clearFiles: () => void
}

export const useCodeStore = create<CodeStore>((set) => ({
  files: {},
  setFiles: (files) => set({ files }),
  clearFiles: () => set({ files: {} }),
}))
