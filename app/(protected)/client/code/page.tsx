'use client'

import { Loader } from 'lucide-react'
import { useEffectOnce } from 'react-use'
import { useRef, useState } from 'react'

import { Terminal } from './components/terminal'
import { initialFiles } from '@/constants/code'
import { FileExplorer } from './components/file-explorer'
import { CodeEditor, EditorRef } from './components/editor'
import { getWebContainerInstance } from '@/lib/webcontainer'

export default function CodePage() {
  const [webcontainerInstance, setWebcontainerInstance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const editorRef = useRef<EditorRef>(null)

  useEffectOnce(() => {
    async function bootWebContainer() {
      try {
        setLoading(true)
        const instance = await getWebContainerInstance()
        setWebcontainerInstance(instance)

        await instance.mount(initialFiles)

        instance.on('server-ready', (port: number, url: string) => {
          if (iframeRef.current) {
            iframeRef.current.src = url
          }
          console.log('WebContainer instance started:', url, port)
        })
      } catch (error) {
        console.error('WebContainer instance failed to start:', error)
      } finally {
        setLoading(false)
      }
    }

    bootWebContainer()
  })

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
        <div className="col-span-1 rounded-lg border border-gray-200">
          <FileExplorer
            webcontainerInstance={webcontainerInstance}
            onFileSelectAction={(path) => {
              editorRef.current?.loadFile(path)
            }}
          />
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          <div className="flex-1 rounded-lg border border-gray-200">
            <CodeEditor
              ref={editorRef}
              webcontainerInstance={webcontainerInstance}
            />
          </div>
          <div className="h-48 rounded-lg border border-gray-200">
            <Terminal webcontainerInstance={webcontainerInstance} />
          </div>
        </div>

        <div className="col-span-1 rounded-lg border border-gray-200">
          <iframe
            ref={iframeRef}
            className="h-full w-full rounded-lg"
            title="WebContainer Preview"
          />
        </div>
      </div>
    </div>
  )
}
