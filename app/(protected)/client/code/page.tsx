'use client'

import { Loader, Download } from 'lucide-react'
import { FileSystemTree } from '@webcontainer/api'
import { useEffect, useRef, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { Preview } from './components/preview'
import { Terminal } from './components/terminal'
import { FileExplorer } from './components/file-explorer'
import { useSidebarContext } from '../context/sidebar-context'
import { CodeEditor, EditorRef } from './components/code-editor'
import { PreviewProvider, usePreviewContext } from '../context/preview-context'
import { Button } from '@/components/ui/button'

import { initialFiles } from '@/constants/code'
import { getWebContainerInstance } from '@/lib/webcontainer'
import { useWebContainerStore } from '@/stores/web-container'

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
  const editorRef = useRef<EditorRef>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string>('')
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed } = useSidebarContext()
  const { collapsed: previewCollapsed, setCollapsed: setPreviewCollapsed } = usePreviewContext()
  const initialLoadRef = useRef(true)
  const previewPanelRef = useRef<any>(null)
  const [animating, setAnimating] = useState(false)

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

        const webcontainerFiles = initialFiles

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

  const handleExport = async () => {
    if (!instance) return

    try {
      setExporting(true)
      const data = await instance.export('.', { format: 'zip' })
      const zip = new Blob([data], { type: 'application/zip' })

      // Create download link
      const url = window.URL.createObjectURL(zip)
      const link = document.createElement('a')
      link.href = url
      link.download = 'code-export.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 py-2">
        <div className="select-none text-lg font-semibold text-gray-700">Code Workspace</div>
        <Button
          onClick={handleExport}
          disabled={exporting || !instance}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full border-gray-300 px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-gray-100">
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Code'}
        </Button>
      </div>
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
