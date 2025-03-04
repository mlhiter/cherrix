import { Navbar } from './components/navbar'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-sky-500">
      <Navbar />
      {children}
    </div>
  )
}

export default ProtectedLayout
