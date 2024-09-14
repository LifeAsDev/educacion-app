import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { compare } from "bcrypt";
import { JWT } from "next-auth/jwt";

const handler = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      return true;
    },

    async jwt({ token }) {
      try {
        const fetchUrl = `${process.env.NEXTAUTH_URL}/api/user/${token.sub}`;
        const res = await fetch(fetchUrl, {
          method: "GET",
          headers: { "Content-type": "application/json" },
        });
        if (res.ok) {
          const resData = await res.json();
          token = { ...token, ...resData.user };
        } else {
          token = { ...token, signOutNextAuth: true };
        }
      } catch (error) {
        token = { ...token, signOutNextAuth: true };

        console.log(error);
      }
      return token;
    },

    async session({ session, user, token }) {
      session = { ...session, ...token };

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        password: {
          label: "Password",
          type: "password",
        },
        email: {
          label: "Email",
          type: "text",
        },
        dni: { label: "DNI", type: "text" },
      },

      async authorize(credentials) {
        console.log({ credentials });
        await connectMongoDB();
        const user = await User.findOne({
          dni: credentials?.dni,
        });

        if (!user && !user.review) {
          console.log("Invalid DNI");
          throw new Error("Wrong credentials");
        }

        if (credentials?.password === user.password) {
          return { id: user.id };
        } else {
          console.log("Invalid Password");
          throw new Error("Wrong credentials");
        }
      },
    }),
  ],

  pages: {
    signIn: "/",
    error: "/",
  },

  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
