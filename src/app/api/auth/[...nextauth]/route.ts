import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/app/lib/mongodb"; // Corrected path to be more standard
import User from "@/models/user"; // Import your User model

export const authOptions: AuthOptions = {
  // Use the MongoDB adapter to connect NextAuth with your database
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    // Use JSON Web Tokens for session management
    strategy: "jwt",
  },
  callbacks: {
    // The jwt callback is called whenever a JWT is created or updated.
    async jwt({ token, user }) {
      // On the initial sign-in, the 'user' object is available.
      // We persist the user's ID and role to the token.
      if (user) {
        token.id = user.id;
        // The user object here is from the database, so we can access the role
        // This assumes your adapter returns the full user object.
        const dbUser = await User.findOne({ email: user.email });
        token.role = dbUser.role;
      }
      return token;
    },
    // The session callback is called whenever a session is accessed.
    async session({ session, token }) {
      // We transfer the 'id' and 'role' from the token to the session object.
      // This makes the data available on the client-side.
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    // You can specify custom pages for sign-in, sign-out, etc.
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
