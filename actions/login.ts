'use server'

import { z } from 'zod'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { LoginSchema } from '@/schemas'
import { DEFAULT_REDIRECT_URL } from '@/routes'

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validated = LoginSchema.safeParse(values)

  if (!validated.success) {
    return { error: 'Invalid email or password!' }
  }

  const { email, password } = validated.data
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_REDIRECT_URL,
    })
    return { success: 'Logged in successfully!' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials!' }
        default:
          return { error: 'Something went wrong!' }
      }
    }

    throw error
  }
}
