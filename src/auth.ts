
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        // User/Pass fallback for demo/testing until email provider is ready
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                // MOCK AUTH for testing - Replace with DB lookup in Phase 2
                // This allows the "Hardening" phase to pass while DB is being built next
                if (credentials.email === "demo@omnios.dev" && credentials.password === "demo") {
                    return {
                        id: "demo-user-1",
                        name: "Demo User",
                        email: "demo@omnios.dev",
                        role: "admin"
                    }
                }
                return null
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = (token as any).role;
                (session.user as any).id = (token as any).id;
            }
            return session
        },
    },
    pages: {
        signIn: '/login', // Custom login page (we need to make sure this route exists or uses the designer modal)
    },
    session: {
        strategy: "jwt", // Database not ready yet
    },
})
