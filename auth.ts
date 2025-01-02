import NextAuth from 'next-auth'
import { UserRole } from '@prisma/client'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { db } from '@/lib/db'
import authConfig from '@/auth.config'
import { getUserById } from './data/user'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user }) {
      if (!user.id) return false

      const existingUser = await getUserById(user.id)

      if (!existingUser || !existingUser.emailVerified) return false

      return true
    },
    async session({ session, token }) {
      // token.sub is the id of the user
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }
      return session
    },
    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)

      if (!existingUser) return token

      token.role = existingUser.role

      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
})
