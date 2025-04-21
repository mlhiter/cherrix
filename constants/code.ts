import { editor } from 'monaco-editor'

export const initialFiles = {
  'package.json': {
    file: {
      contents: `
{
  "name": "nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0"
  }
}`,
    },
  },
  'tsconfig.json': {
    file: {
      contents: `
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
    },
  },
  'next.config.js': {
    file: {
      contents: `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig`,
    },
  },
  app: {
    directory: {
      'layout.tsx': {
        file: {
          contents: `
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'Created with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`,
        },
      },
      'globals.css': {
        file: {
          contents: `
@tailwind base;
@tailwind components;
@tailwind utilities;`,
        },
      },
      'page.tsx': {
        file: {
          contents: `
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
        <p className="mt-4">Get started by editing app/page.tsx</p>
      </div>
    </main>
  )
}`,
        },
      },
    },
  },
}

export const MONACO_EDITOR_CONFIG: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  automaticLayout: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true,
  },
  parameterHints: {
    enabled: true,
  },
  wordBasedSuggestions: 'allDocuments',
  suggestSelection: 'first',
  tabCompletion: 'on',
  acceptSuggestionOnEnter: 'on',
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  formatOnPaste: true,
  formatOnType: true,
  folding: true,
  renderWhitespace: 'selection',
  renderLineHighlight: 'all',
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible',
    useShadows: false,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
}
