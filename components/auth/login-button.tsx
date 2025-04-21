'use client'

import { useRouter } from 'next/navigation'

import { LoginForm } from './login-form'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'

interface LoginButtonProps {
  children: React.ReactNode
  mode?: 'modal' | 'redirect'
  asChild?: boolean
}

export const LoginButton: React.FC<LoginButtonProps> = ({ children, mode = 'redirect', asChild = false }) => {
  const router = useRouter()

  const onClick = () => {
    router.push('/auth/login')
  }

  if (mode === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className="w-auto border-none bg-transparent p-0">
          <DialogTitle className="sr-only">Login</DialogTitle>
          <LoginForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <span className="cursor-pointer hover:underline" onClick={onClick}>
      {children}
    </span>
  )
}
