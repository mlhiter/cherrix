import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { LoginSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validated = LoginSchema.safeParse(credentials)
        if (!validated.success) return null

        const { email, password } = validated.data

        const user = await getUserByEmail(email)
        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (passwordMatch) return user

        return null
      },
    }),
  ],
} satisfies NextAuthConfig
