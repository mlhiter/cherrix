'use server'

import { db } from '@/lib/db'
import { getUserByEmail } from '@/data/user'
import { getVerificationTokenByToken } from '@/data/verification-token'

export const newVerification = async (token: string) => {
  const existingVerificationToken = await getVerificationTokenByToken(token)
  if (!existingVerificationToken) {
    return { error: 'Verification token not found!' }
  }

  const hasExpired = new Date(existingVerificationToken.expires) < new Date()

  if (hasExpired) {
    return { error: 'Verification token has expired!' }
  }

  const existingUser = await getUserByEmail(existingVerificationToken.email)
  if (!existingUser) {
    return { error: 'User not found!' }
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: { emailVerified: new Date(), email: existingVerificationToken.email },
  })

  await db.verificationToken.delete({
    where: { id: existingVerificationToken.id },
  })

  return { success: 'Email verified!' }
}
