import NextAuth, { DefaultSession } from "next-auth";
import User from "@/models/user";
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    signOutNextAuth: true;
    user: {
      /** The user's postal address. */
      address: string;
    } & DefaultSession["user"];
  }
}
