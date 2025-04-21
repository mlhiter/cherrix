import { Poppins } from 'next/font/google'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'
import { LoginButton } from '@/components/auth/login-button'

const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-violet-900">
      <div className="space-y-6 text-center">
        <h1 className={cn('text-6xl font-semibold text-white drop-shadow-md', font.className)}>🍒 Cherrix</h1>
        <p className={cn('text-2xl text-white drop-shadow-lg', font.className)}>
          Knowledge Base; For developers; AI driven
        </p>
        <div>
          <LoginButton mode="modal" asChild>
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  )
}
