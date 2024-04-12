import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { compare } from "bcrypt";

const handler = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      return true;
    },
    /* jwt= json web token, this is a way to save the user session when logged on the cache, 
    Nextauth manage it for default,
    you can save data of the user here, this callback run before of session callback,
    this callback is called on getSession(), getServerSession(), useSession().

    The arguments user, account, profile and isNewUser are only passed the first time this callback 
    is called on a new session, after the user signs in. In subsequent calls, only token will be available. 
    
    The token data it only visible on backend so the data we set here is not visible on the session object 
    we get from useSession(), to get data to that object we use the callback session below*/
    async jwt({ token, account, profile }) {
      return token;
    },

    async session({ session, user, token }) {
      try {
        const fetchUrl = `${process.env.NEXTAUTH_URL}/api/user/${token.sub}`;
        const res = await fetch(fetchUrl, {
          method: "GET",
          headers: { "Content-type": "application/json" },
        });
        if (res.ok) {
          const resData = await res.json();

          session = { ...session, ...resData };
        } else {
        }
      } catch (error) {
        console.log(error);
      }
      return session;
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
      },

      async authorize(credentials) {
        await connectMongoDB();

        const user = await User.findOne({
          email: credentials?.email.toUpperCase(),
        });

        if (!user) {
          console.log("Invalid Email");
          throw new Error("Wrong credentials");
        }

        if (await compare(credentials!.password, user.password)) {
          return { email: user.email, firstName: user.firstName, id: user.id };
        } else {
          console.log("Invalid Password");
          throw new Error("Wrong credentials");
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
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
