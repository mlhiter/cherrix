'use client'

import { useEffect, useRef } from 'react'
import { WebContainer } from '@webcontainer/api'
import { useTerminalStore } from '@/stores/terminal'

interface TerminalProps {
  webcontainerInstance: WebContainer | null
}

export function Terminal({ webcontainerInstance }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const { output, input, isInitialized, executeCommand, setInput } =
    useTerminalStore()

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
    if (webcontainerInstance && !isInitialized) {
      const checkAndInitialize = async () => {
        try {
          const files = await webcontainerInstance.fs.readdir('/')
          const hasNodeModules = files.includes('node_modules')

          if (!hasNodeModules) {
            await executeCommand(webcontainerInstance, 'npm install')
          }
          executeCommand(webcontainerInstance, 'npm run dev')
        } catch (error) {
          console.error('Error checking node_modules:', error)
        }
      }

      checkAndInitialize()
    }
  }, [webcontainerInstance])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && webcontainerInstance) {
      const command = input.trim()
      if (!command) return

      await executeCommand(webcontainerInstance, command)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-gray-50 font-mono text-gray-800 shadow-lg">
      <div className="mb-2 rounded-md rounded-b-none border-b border-gray-200 bg-gray-100 p-2 text-sm font-medium">
        <span className="text-sm text-gray-500">Terminal</span>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto whitespace-pre-wrap bg-white p-4 font-mono text-sm">
        {cleanAnsiEscapeSequences(output)}
      </div>
      <div className="flex items-center border-t border-gray-200 bg-gray-50 p-3">
        <span className="mr-2 font-bold text-green-600">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 outline-none"
          placeholder="Input command..."
        />
      </div>
    </div>
  )
}

// delete ANSI escape sequences
const cleanAnsiEscapeSequences = (text: string) => {
  return text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
}
