import { create } from 'zustand'
import { WebContainer } from '@webcontainer/api'

type WebContainerStatus = 'idle' | 'installing' | 'starting' | 'running' | 'error'

interface WebContainerState {
  instance: WebContainer | null
  status: WebContainerStatus
  setInstance: (instance: WebContainer | null) => void
  setStatus: (status: WebContainerStatus) => void
}

export const useWebContainerStore = create<WebContainerState>((set) => ({
  instance: null,
  status: 'idle',
  setInstance: (instance) => set({ instance }),
  setStatus: (status) => set({ status }),
}))
