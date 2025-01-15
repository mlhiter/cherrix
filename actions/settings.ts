'use server'

import * as z from 'zod'
import bcrypt from 'bcryptjs'

import { db } from '@/lib/db'
import { currentUser } from '@/lib/auth'
import { getUserById } from '@/data/user'
import { SettingsSchema } from '@/schemas'
import { sendVerificationEmail } from '@/lib/mail'
import { generateVerificationToken } from '@/lib/tokens'

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser()

  if (!user || !user.id) {
    return { error: 'User not found' }
  }

  const dbUser = await getUserById(user.id)

  if (!dbUser) {
    return { error: 'Unauthorized' }
  }

  // Oauth users cannot change their email, password, or two factor authentication
  if (user.isOAuth) {
    values.email = undefined
    values.password = undefined
    values.newPassword = undefined
    values.isTwoFactorEnabled = undefined
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await db.user.findUnique({
      where: { email: values.email },
    })
    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email already in use' }
    }

    const verification = await generateVerificationToken(values.email)

    await sendVerificationEmail(values.email, verification.token)

    return { success: 'Verification email sent' }
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordMatch = await bcrypt.compare(values.password, dbUser.password)
    if (!passwordMatch) {
      return { error: 'Incorrect password!' }
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10)
    values.password = hashedPassword
    values.newPassword = undefined
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: { ...values },
  })

  return { success: 'Settings updated' }
}
