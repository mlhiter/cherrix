'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'

import { db } from '@/lib/db'
import { RegisterSchema } from '@/schemas'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validated = RegisterSchema.safeParse(values)

  if (!validated.success) {
    return { error: 'Invalid email or password!' }
  }

  const { email, password, name } = validated.data

  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return { error: 'User already exists!' }
  }

  await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  })

  // TODO: Send email verification

  return { success: 'Register successful!' }
}
