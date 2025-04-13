import { WebContainer } from '@webcontainer/api'

let webcontainerInstance: WebContainer | null = null
let isBooting = false

export async function getWebContainerInstance() {
  if (webcontainerInstance) {
    return webcontainerInstance
  }

  if (isBooting) {
    throw new Error('WebContainer is already booting')
  }

  try {
    isBooting = true
    webcontainerInstance = await WebContainer.boot()
    return webcontainerInstance
  } catch (error) {
    webcontainerInstance = null
    throw error
  } finally {
    isBooting = false
  }
}

export function getWebContainerInstanceSync() {
  return webcontainerInstance
}
