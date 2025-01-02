'use client'

import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

interface LoginButtonProps {
  children: React.ReactNode
  mode?: 'modal' | 'redirect'
  asChild?: boolean
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  children,
  mode = 'redirect',
  asChild = false,
}) => {
  const router = useRouter()

  const onClick = () => {
    router.push('/auth/login')
  }

  if (mode === 'modal') {
    return <span>TODO:Implement modal</span>
  }

  return (
    <span className="cursor-pointer hover:underline" onClick={onClick}>
      {children}
    </span>
  )
}
