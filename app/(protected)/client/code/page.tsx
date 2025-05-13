'use client'

import { Loader } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSidebarContext } from '../context/sidebar-context'
import { PreviewProvider, usePreviewContext } from '../context/preview-context'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { Preview } from './components/preview'
import { Terminal } from './components/terminal'
import { FileExplorer } from './components/file-explorer'
import { CodeEditor, EditorRef } from './components/code-editor'

import { initialFiles } from '@/constants/code'
import { getWebContainerInstance } from '@/lib/webcontainer'
import { useWebContainerStore } from '@/stores/web-container'
import { useCodeStore } from '@/stores/code'
import { FileSystemTree } from '@webcontainer/api'

function ResizeHandle({ className = '', ...props }: { className?: string; [key: string]: any }) {
  return (
    <PanelResizeHandle
      className={`group relative flex w-2 items-center justify-center bg-transparent transition hover:bg-gray-200 ${className}`}
      {...props}>
      <div className="h-8 w-0.5 rounded-full bg-gray-300 group-hover:bg-gray-400" />
    </PanelResizeHandle>
  )
}

function VerticalResizeHandle({ className = '', ...props }: { className?: string; [key: string]: any }) {
  return (
    <PanelResizeHandle
      className={`group relative flex h-2 items-center justify-center bg-transparent transition hover:bg-gray-200 ${className}`}
      {...props}>
      <div className="h-0.5 w-8 rounded-full bg-gray-300 group-hover:bg-gray-400" />
    </PanelResizeHandle>
  )
}

function CodePageContent() {
  const searchParams = useSearchParams()
  const editorRef = useRef<EditorRef>(null)
  const [loading, setLoading] = useState(true)
  const [iframeUrl, setIframeUrl] = useState<string>('')
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed } = useSidebarContext()
  const { collapsed: previewCollapsed, setCollapsed: setPreviewCollapsed } = usePreviewContext()
  const initialLoadRef = useRef(true)
  const previewPanelRef = useRef<any>(null)
  const [animating, setAnimating] = useState(false)
  const { files, setFiles } = useCodeStore()

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

        const webcontainerFiles = files ? files : initialFiles

        await webcontainerInstance.mount(webcontainerFiles as FileSystemTree)

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

  useEffect(() => {
    if (previewPanelRef.current) {
      setAnimating(true)

      setTimeout(() => {
        if (previewCollapsed) {
          previewPanelRef.current.resize(3)
        } else {
          previewPanelRef.current.resize(25)
        }

        setTimeout(() => {
          setAnimating(false)
        }, 300)
      }, 0)
    }
  }, [previewCollapsed])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <PanelGroup direction="horizontal" className="flex-1">
        {/* File Explorer */}
        <Panel defaultSize={20} minSize={10} className="rounded-lg border border-gray-200">
          <FileExplorer
            webcontainerInstance={instance}
            onFileSelectAction={(path) => {
              editorRef.current?.loadFile(path)
            }}
          />
        </Panel>

        <ResizeHandle />

        {/* Code Editor and Terminal */}
        <Panel defaultSize={previewCollapsed ? 80 : 55} className="flex flex-col gap-4">
          <PanelGroup direction="vertical" className="h-full">
            <Panel defaultSize={70} className="rounded-lg border border-gray-200">
              <CodeEditor ref={editorRef} webcontainerInstance={instance} />
            </Panel>

            <VerticalResizeHandle />

            <Panel defaultSize={30} className="rounded-lg border border-gray-200">
              <Terminal webcontainerInstance={instance} />
            </Panel>
          </PanelGroup>
        </Panel>

        <ResizeHandle />

        {/* Preview */}
        <Panel
          ref={previewPanelRef}
          defaultSize={previewCollapsed ? 3 : 25}
          minSize={3}
          className="overflow-hidden rounded-lg border border-gray-200"
          style={{
            transition: animating ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}>
          <Preview iframeUrl={iframeUrl} />
        </Panel>
      </PanelGroup>
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
