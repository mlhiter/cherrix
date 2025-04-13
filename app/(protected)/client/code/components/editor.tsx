'use client'

import { WebContainer } from '@webcontainer/api'
import { forwardRef, useImperativeHandle } from 'react'
import MonacoEditor, { loader } from '@monaco-editor/react'

import { useFileSystemStore } from '@/stores/fileSystem'
import { MONACO_EDITOR_CONFIG } from '@/constants/monaco-editor'

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
  },
})

interface EditorProps {
  webcontainerInstance: WebContainer | null
}

export interface EditorRef {
  loadFile: (path: string) => Promise<void>
}

export const CodeEditor = forwardRef<EditorRef, EditorProps>(
  ({ webcontainerInstance }, ref) => {
    const { currentFile, fileContent, loadFile, saveFile } =
      useFileSystemStore()

    useImperativeHandle(ref, () => ({
      loadFile: (path: string) => loadFile(webcontainerInstance, path),
    }))

    const handleEditorWillMount = async (monaco: any) => {
      if (!webcontainerInstance) return

      try {
        const tsconfigContent = await webcontainerInstance.fs.readFile(
          'tsconfig.json',
          'utf-8'
        )
        const tsconfig = JSON.parse(tsconfigContent)

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          ...tsconfig.compilerOptions,
          allowNonTsExtensions: true,
          isolatedModules: true,
        })

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          `declare module 'next/font/google' {
            interface FontOptions {
              weight?: string | number | Array<string | number>;
              style?: string;
              subsets?: string[];
            }
            export function Inter(options?: FontOptions): {
              className: string;
              style: { fontFamily: string };
            };
          }`,
          'next-types.d.ts'
        )
      } catch (error) {
        console.error('Failed to configure TypeScript:', error)
      }
    }

    return (
      <div className="flex h-full flex-col">
        <div className="mb-2 rounded-md rounded-b-none border-b border-gray-200 bg-gray-100 p-2 text-sm font-medium">
          <div className="text-sm font-medium">
            {currentFile || 'Select a file'}
          </div>
        </div>

        <div className="flex-1">
          {currentFile ? (
            <MonacoEditor
              height="100%"
              language={getLanguageFromFileName(currentFile)}
              value={fileContent}
              onChange={(value) => saveFile(webcontainerInstance, value || '')}
              theme="vs"
              beforeMount={handleEditorWillMount}
              options={MONACO_EDITOR_CONFIG}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-gray-500">
              Please select a file from the file browser first.
            </div>
          )}
        </div>
      </div>
    )
  }
)

export const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'json':
      return 'json'
    case 'md':
      return 'markdown'
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    case 'c':
      return 'c'
    case 'cpp':
      return 'cpp'
    case 'go':
      return 'go'
    case 'rs':
      return 'rust'
    default:
      return 'plaintext'
  }
}
