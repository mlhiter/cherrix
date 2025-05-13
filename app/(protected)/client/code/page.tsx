'use client'

import { Loader } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSidebarContext } from '../context/sidebar-context'
import { PreviewProvider, usePreviewContext } from '../context/preview-context'

import { Preview } from './components/preview'
import { Terminal } from './components/terminal'
import { FileExplorer } from './components/file-explorer'
import { CodeEditor, EditorRef } from './components/code-editor'

import { initialFiles } from '@/constants/code'
import { getWebContainerInstance } from '@/lib/webcontainer'
import { useWebContainerStore } from '@/stores/web-container'

function CodePageContent() {
  const editorRef = useRef<EditorRef>(null)
  const [loading, setLoading] = useState(true)
  const [iframeUrl, setIframeUrl] = useState<string>('')
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed } = useSidebarContext()
  const { collapsed: previewCollapsed } = usePreviewContext()
  const initialLoadRef = useRef(true)

  const { instance, setInstance, setStatus } = useWebContainerStore()

  useEffect(() => {
    async function bootWebContainer() {
      try {
        setLoading(true)
        setStatus('starting')
        const webcontainerInstance = await getWebContainerInstance()

        webcontainerInstance.on('server-ready', (port: number, url: string) => {
          setStatus('running')
          setIframeUrl(url)
        })

        await webcontainerInstance.mount(initialFiles)

        setInstance(webcontainerInstance)
      } catch (error) {
        console.error('WebContainer instance failed to start:', error)
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }

    bootWebContainer()

    return () => {
      if (instance) {
        instance.teardown()
        setInstance(null)
        setStatus('idle')
      }
    }
  }, [])

  // Side-effect to auto-collapse sidebar ONLY on initial component mount
  useEffect(() => {
    // Only auto-collapse on initial mount, not on every render or state change
    if (initialLoadRef.current) {
      const timer = setTimeout(() => {
        setSidebarCollapsed(true)
        initialLoadRef.current = false
      }, 500) // Small delay to ensure UI is rendered first

      return () => clearTimeout(timer)
    }
  }, [setSidebarCollapsed])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-1 gap-4">
        {/* File Explorer */}
        <div className="w-1/4 rounded-lg border border-gray-200">
          <FileExplorer
            webcontainerInstance={instance}
            onFileSelectAction={(path) => {
              editorRef.current?.loadFile(path)
            }}
          />
        </div>

        {/* Code Editor and Terminal */}
        <div className="flex flex-1 flex-col gap-4 transition-all duration-300 ease-in-out">
          <div className="flex-1 rounded-lg border border-gray-200">
            <CodeEditor ref={editorRef} webcontainerInstance={instance} />
          </div>
          <div className="h-48 rounded-lg border border-gray-200">
            <Terminal webcontainerInstance={instance} />
          </div>
        </div>

        {/* Preview */}
        <div
          className="overflow-hidden rounded-lg border border-gray-200 transition-all duration-300 ease-in-out"
          style={{ width: previewCollapsed ? '40px' : '25%' }}>
          <Preview iframeUrl={iframeUrl} />
        </div>
      </div>
    </div>
  )
}

export default function CodePage() {
  return (
    <PreviewProvider initialCollapsed={false}>
      <CodePageContent />
    </PreviewProvider>
  )
}
