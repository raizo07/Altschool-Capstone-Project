import NextAuth from "next-auth"; // Import NextAuth for authentication handling
import "next-auth/jwt"; // Import JWT types and utilities from NextAuth
import authConfig from "@/auth.config"; // Import custom authentication configuration
import { PrismaAdapter } from "@auth/prisma-adapter"; // Import Prisma adapter for NextAuth to connect to the database
import { db } from "@/lib/db"; // Import the database instance for data operations
import "next-auth"; // Import additional NextAuth types
import { userRole } from "@prisma/client"; // Import the user role type from Prisma
import { encode } from "next-auth/jwt"; // Import JWT encoding utility from NextAuth

// Extend NextAuth's User interface to include custom fields
declare module "next-auth" {
  interface User {
    id?: string; // Optional user ID
    role?: userRole; // Optional user role based on Prisma enum
    accessToken?: string; // Optional access token for API requests
    totalClicks?: number; // Optional total number of clicks associated with the user
    uniqueCountryCount?: number; // Optional count of unique countries where clicks were received
    totalLinksCount?: number; // Optional total number of links created by the user
  }

  interface Session {
    user: User; // Extend the session's user object to include the custom User interface
  }
}

// Extend NextAuth's JWT interface to include custom fields
declare module "next-auth/jwt" {
  interface JWT {
    id: string; // User ID for the JWT
    role?: userRole; // Optional user role for the JWT
    totalClicks?: number; // Optional total number of clicks associated with the JWT
    uniqueCountryCount?: number; // Optional count of unique countries for clicks in the JWT
    totalLinksCount?: number; // Optional total number of links associated with the JWT
  }
}

// Initialize and configure NextAuth with custom settings
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db), // Use PrismaAdapter to connect NextAuth to the Prisma database
  session: { strategy: "jwt" }, // Use JWT strategy for session management
  ...authConfig, // Spread in additional custom authentication configurations
  callbacks: {
    /**
     * Callback to manage and modify the JWT before it is returned.
     * Includes custom fields such as user role, total clicks, and link counts.
     *
     * @param {Object} token - The JWT token object.
     * @param {Object} user - The user object (only available at sign-in).
     * @returns {Object} - The modified token.
     */
    async jwt({ token, user }) {
      if (user) {
        // Fetch user details along with associated links from the database
        const userWithLinks = await db.user.findUnique({
          where: { id: user.id },
          include: { links: true },
        });
        // Add custom fields to the JWT
        token.role = user.role;
        token.totalClicks = user.totalClicks;
        token.uniqueCountryCount = user.uniqueCountryCount;
        token.totalLinksCount = userWithLinks?.links.length || 0;
      }
      return token;
    },

    /**
     * Callback to manage the session object before it is returned to the client.
     * Synchronizes session user data with the JWT token.
     *
     * @param {Object} session - The session object.
     * @param {Object} token - The JWT token object.
     * @returns {Object} - The modified session.
     */
    async session({ session, token, user }) {
      if (token.sub) {
        // Assign JWT fields to the session user object
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.totalClicks = token.totalClicks;
        session.user.uniqueCountryCount = token.uniqueCountryCount; 
        session.user.totalLinksCount = token.totalLinksCount;
      }
      
      // Retain only necessary fields in the session user object
      const { id, ...restOfUser } = session.user;
      session.user = { id, ...restOfUser };
      return session;
    },
  },
});
