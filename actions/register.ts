'use server'

import { z } from 'zod'

import { RegisterSchema } from '@/schemas'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validated = RegisterSchema.safeParse(values)

  if (!validated.success) {
    return { error: 'Invalid email or password!' }
  }

  return { success: 'Register successful!' }
}
