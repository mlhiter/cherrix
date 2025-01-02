'use client'

import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { Button } from '../ui/button'

export const Social = () => {
  return (
    <div className="flex w-full items-center justify-center gap-x-2 gap-y-4">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => {
          console.log('google')
        }}>
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => {
          console.log('github')
        }}>
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  )
}
