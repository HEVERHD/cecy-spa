import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user.password) return null
          if (user.role !== "BARBER" && user.role !== "ADMIN") return null

          const valid = await bcrypt.compare(credentials.password, user.password)
          if (!valid) return null

          return user
        } catch (err) {
          console.error("[auth] credentials authorize error:", err)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Skip role check for credentials — already validated in authorize()
      if (!account || account.provider === "credentials") return true

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || "" },
          select: { role: true },
        })
        if (!dbUser || (dbUser.role !== "BARBER" && dbUser.role !== "ADMIN")) {
          return "/login?error=unauthorized"
        }
        return true
      } catch (err) {
        console.error("[auth] signIn callback error:", err)
        return "/login?error=unauthorized"
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      // Refresh role from DB
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          })
          if (dbUser) {
            token.role = dbUser.role
          }
        } catch (err) {
          console.error("[auth] jwt role refresh error:", err)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
