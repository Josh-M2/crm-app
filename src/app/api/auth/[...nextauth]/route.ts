import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import prismaInstance from "@/lib/prismaInstance";

const handler = NextAuth({
  adapter: PrismaAdapter(prismaInstance),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("MissingInputs");
        }

        // Check if the user already exists (for login)
        let user = await prismaInstance.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("UserNotFound");
        }

        console.log("useruseruser: ", user);
        // If the user exists, check the password for login
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("WrongPassword");
        } // Invalid password, return null

        return user; // Return user object to log in
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // pages: {
  //   signIn: "/auth/login",
  //   signOut: "/auth/logout",
  //   error: "/auth/error",
  // },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
