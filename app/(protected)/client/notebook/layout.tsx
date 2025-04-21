'use client'

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-center text-2xl font-bold">Notebook</div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
