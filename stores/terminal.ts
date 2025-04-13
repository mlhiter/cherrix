import { create } from 'zustand'
import { WebContainer } from '@webcontainer/api'
import { useFileSystemStore } from '@/stores/file-system'
import { useWebContainerStore } from '@/stores/web-container'

interface TerminalState {
  output: string
  input: string
  isInitialized: boolean
  executeCommand: (
    webcontainerInstance: WebContainer | null,
    command: string
  ) => Promise<void>
  setInput: (input: string) => void
  clearOutput: () => void
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  output: '',
  input: '',
  isInitialized: false,

  executeCommand: async (webcontainerInstance, command) => {
    if (!webcontainerInstance) return

    if (command === 'npm install') {
      useWebContainerStore.getState().setStatus('installing')
    }

    set((state) => ({ output: state.output + `$ ${command}\n`, input: '' }))

    try {
      const [cmd, ...args] = command.split(' ')
      const process = await webcontainerInstance.spawn(cmd, args)

      process.output.pipeTo(
        new WritableStream({
          write(chunk) {
            set((state) => ({ output: state.output + chunk }))
          },
        })
      )

      const exitCode = await process.exit
      if (exitCode !== 0) {
        set((state) => ({
          output: state.output + `\nProcess exited with code ${exitCode}\n`,
        }))
      }

      if (command === 'npm install') {
        const { buildFileTree } = useFileSystemStore.getState()
        await buildFileTree(webcontainerInstance)
      }
    } catch (error) {
      set((state) => ({ output: state.output + `\nError: ${error}\n` }))
      useWebContainerStore.getState().setStatus('error')
    }
  },

  setInput: (input) => set({ input }),

  clearOutput: () => set({ output: '' }),
}))
