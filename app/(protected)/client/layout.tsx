import { Sidebar } from './components/sidebar'

interface ClientLayoutProps {
  children: React.ReactNode
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-white p-4">
      <div className="flex w-full gap-6">
        <Sidebar />
        <main className="flex flex-1 flex-col border-l p-4">{children}</main>
      </div>
    </div>
  )
}

export default ClientLayout
