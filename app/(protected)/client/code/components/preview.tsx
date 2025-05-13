'use client'

import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { usePreviewContext } from '../../context/preview-context'
import { useWebContainerStore } from '@/stores/web-container'

interface PreviewProps {
  iframeUrl: string
}

export const Preview = ({ iframeUrl }: PreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { collapsed, setCollapsed } = usePreviewContext()

  useEffect(() => {
    if (iframeRef.current) {
      console.log('iframeUrl', iframeUrl)
      iframeRef.current.src = iframeUrl
    }
  }, [iframeUrl])

  const { status } = useWebContainerStore()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {collapsed ? (
        // 折叠状态 - 显示垂直标题和按钮
        <button
          onClick={() => setCollapsed(false)}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 px-2 py-4 transition-colors hover:bg-gray-200"
          aria-label="Expand preview">
          <div className="rotate-180" style={{ writingMode: 'vertical-rl' }}>
            <span className="text-xs font-medium">Preview</span>
          </div>
          <ChevronRight className="mt-2 h-4 w-4" />
        </button>
      ) : (
        // 展开状态 - 正常显示
        <>
          <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-100 p-2">
            <span className="text-sm font-medium">Preview</span>
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-gray-200"
              aria-label="Collapse preview">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {status !== 'running' ? (
              <div className="flex h-full w-full items-center justify-center rounded-lg">
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-sm font-medium text-gray-600">{getStatusText(status)}</p>
                  {status === 'installing' && (
                    <div className="w-48">
                      <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-200">
                        <div className="h-1.5 w-1/2 rounded-full bg-blue-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <iframe ref={iframeRef} className="h-full w-full" title="WebContainer Preview" />
            )}
          </div>
        </>
      )}
    </div>
  )
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'idle':
      return 'WebContainer is idle'
    case 'installing':
      return 'Installing dependencies...'
    case 'starting':
      return 'Starting WebContainer...'
    case 'running':
      return 'WebContainer is running'
    case 'error':
      return 'Error occurred'
    default:
      return ''
  }
}
