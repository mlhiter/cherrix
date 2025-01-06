'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'

import { db } from '@/lib/db'
import { RegisterSchema } from '@/schemas'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/mail'

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

  // await db.user.create({
  //   data: {
  //     email,
  //     name,
  //     password: hashedPassword,
  //   },
  // })

  const verificationToken = await generateVerificationToken(email)

  await sendVerificationEmail(verificationToken.email, verificationToken.token)

  return { success: 'Confirmation email sent!' }
}
