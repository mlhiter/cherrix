import { Poppins } from 'next/font/google'

import { cn } from '@/lib/utils'

const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

interface HeaderProps {
  label: string
}

export const Header: React.FC<HeaderProps> = ({ label }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <h1 className={cn('text-3xl font-bold', font.className)}>🔐 Auth</h1>
      <p className={cn('text-sm text-muted-foreground', font.className)}>
        {label}
      </p>
    </div>
  )
}
