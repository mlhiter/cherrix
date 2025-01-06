'use server'

import { z } from 'zod'
import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { LoginSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'
import { DEFAULT_REDIRECT_URL } from '@/routes'
import { sendVerificationEmail } from '@/lib/mail'
import { generateVerificationToken } from '@/lib/tokens'

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validated = LoginSchema.safeParse(values)

  if (!validated.success) {
    return { error: 'Invalid email or password!' }
  }

  const { email, password } = validated.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Email does not exist!' }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(email)

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )

    return { success: 'Confirmation email sent!' }
  }

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
