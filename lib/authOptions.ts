import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDbClient } from '@/lib/db';
import bcrypt from 'bcryptjs';
// import { v4 as uuidv4 } from 'uuid'; // Not directly used in authOptions, but in register

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.log("Missing credentials");
          return null;
        }

        const client = getDbClient();
        try {
          console.log(`Attempting to authorize user: ${credentials.email}`);
          const userResult = await client.execute({
            sql: "SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1;",
            args: [credentials.email]
          });

          if (userResult.rows.length === 0) {
            console.log(`No user found with email: ${credentials.email}`);
            return null;
          }

          const user = userResult.rows[0] as any;

          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isValidPassword) {
            console.log(`Invalid password for user: ${credentials.email}`);
            return null;
          }

          console.log(`User authorized: ${credentials.email}`);
          return { id: user.id as string, email: user.email as string, name: user.email as string };
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
