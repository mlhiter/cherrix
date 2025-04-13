'use client'

import { Loader } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Preview } from './components/preview'
import { Terminal } from './components/terminal'
import { FileExplorer } from './components/file-explorer'
import { CodeEditor, EditorRef } from './components/code-editor'

import { initialFiles } from '@/constants/code'
import { getWebContainerInstance } from '@/lib/webcontainer'
import { useWebContainerStore } from '@/stores/web-container'

export default function CodePage() {
  const editorRef = useRef<EditorRef>(null)
  const [loading, setLoading] = useState(true)
  const [iframeUrl, setIframeUrl] = useState<string>('')

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
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="grid flex-1 grid-cols-3 gap-4">
        {/* File Explorer */}
        <div className="col-span-1 rounded-lg border border-gray-200">
          <FileExplorer
            webcontainerInstance={instance}
            onFileSelectAction={(path) => {
              editorRef.current?.loadFile(path)
            }}
          />
        </div>

        {/* Code Editor and Terminal */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="flex-1 rounded-lg border border-gray-200">
            <CodeEditor ref={editorRef} webcontainerInstance={instance} />
          </div>
          <div className="h-48 rounded-lg border border-gray-200">
            <Terminal webcontainerInstance={instance} />
          </div>
        </div>

        {/* Preview */}
        <div className="col-span-1 rounded-lg border border-gray-200">
          <Preview iframeUrl={iframeUrl} />
        </div>
      </div>
    </div>
  )
}
