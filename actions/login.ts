'use server'

import { z } from 'zod'

import { LoginSchema } from '@/schemas'

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validated = LoginSchema.safeParse(values)

  if (!validated.success) {
    return { error: 'Invalid email or password!' }
  }

  return { success: 'Login successful!' }
}
