import NextAuth from "next-auth"; // Import NextAuth for handling authentication
import authConfig from "@/auth.config"; // Import custom authentication configuration
import {
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  ProtectedRoutes,
  loginRoute,
} from "@/routes"; // Import route constants for authentication management

// Initialize NextAuth with the provided configuration
const { auth } = NextAuth(authConfig);

/**
 * Export a middleware function that handles authentication logic based on the request's URL.
 * Redirects users based on their authentication status and the type of route they are accessing.
 *
 * @param {Request} request - The incoming HTTP request object.
 * @returns {Response|void} - The response to redirect the user or undefined to continue.
 */
export default auth((request) => {
  const { pathname } = request.nextUrl; // Extract the pathname from the request URL

  const isLoggedIn = !!request.auth; // Determine if the user is logged in
  const isAuthRoute = authRoutes.includes(pathname); // Check if the current route is an authentication route
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix); // Check if the route is an API authentication route
  const isLoginRoute = pathname === loginRoute; // Check if the current route is the login route
  const isProtectedRoute = pathname.startsWith(ProtectedRoutes); // Check if the route is a protected route

  // If the request is to an API authentication route, allow it without any redirection
  if (isApiAuthRoute) {
    return;
  }

  // If the request is to the login route and the user is not logged in, allow it without redirection
  if (isLoginRoute && !isLoggedIn) {
    return;
  }

  // If the request is to a protected route and the user is not logged in, redirect to the login page
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL(loginRoute, request.url));
  }

  // If the request is to an authentication route and the user is logged in, redirect to the default login redirect route
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  // Allow all other requests to proceed without any redirection
  return;
});
