'use client'

import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { Button } from '../ui/button'
import { signIn } from 'next-auth/react'
import { DEFAULT_REDIRECT_URL } from '@/routes'
import { useSearchParams } from 'next/navigation'

export const Social = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const onClick = (provider: 'google' | 'github') => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_REDIRECT_URL,
    })
  }
  return (
    <div className="flex w-full items-center justify-center gap-x-2 gap-y-4">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => {
          onClick('google')
        }}>
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick('github')}>
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  )
}
