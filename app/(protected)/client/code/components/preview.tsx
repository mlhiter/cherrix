'use client'

import { useEffect, useRef } from 'react'

import { useWebContainerStore } from '@/stores/web-container'

interface PreviewProps {
  iframeUrl: string
}

export const Preview = ({ iframeUrl }: PreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      console.log('iframeUrl', iframeUrl)
      iframeRef.current.src = iframeUrl
    }
  }, [iframeUrl])

  const { status } = useWebContainerStore()

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg">
      <div className="rounded-md rounded-b-none border-b border-gray-200 bg-gray-100 p-2 text-sm font-medium">
        Preview
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
