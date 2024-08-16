import { loginSchema } from "@/schemas"; // Import the schema for validating login fields
import { signIn } from "@/auth"; // Import the signIn function to handle authentication
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"; // Default redirect route after successful login
import { cookies } from "next/headers"; // Import cookies to manage session tokens
import { sanitizeUser } from "@/services/user-service"; // Import service to sanitize and retrieve user data
import rateLimitIP from "@/utils/rate-limit"; // Import utility to enforce rate limiting based on IP
import ErrorWithStatus from "@/exception/custom-error"; // Custom error class to handle errors with status codes
import { AuthError } from "next-auth"; // Import AuthError class to handle authentication-specific errors

/**
 * Handles the POST request for user login.
 * Validates the input, performs sign-in, and returns user data along with an access token.
 * Implements rate limiting and proper error handling for various failure scenarios.
 *
 * @param {Request} request - The incoming HTTP request object.
 * @param {Response} response - The outgoing HTTP response object.
 * @returns {Promise<Response>} - The response containing the result of the login operation.
 */
export async function POST(request: Request, response: Response) {
  try {
    // Apply rate limiting based on IP to prevent abuse
    await rateLimitIP(request);

    // Parse and validate the request body using the login schema
    const body = await request.json();
    const validatedFields = loginSchema.safeParse(body);
    if (!validatedFields.success) {
      // Throw a custom error if validation fails
      throw new ErrorWithStatus("Invalid fields", 400);
    }

    // Destructure validated email and password from the request body
    const { email, password } = validatedFields.data;

    // Attempt to sign in the user using credentials, with no redirect
    await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });

    // Retrieve and sanitize user data based on the provided email
    const user = await sanitizeUser(email);

    // Get the session token from cookies
    const accessToken = cookies().get("authjs.session-token")?.value;

    // Return a successful response with the access token and sanitized user data
    return Response.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    // Handle custom errors with status codes
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    // Handle authentication errors (e.g., invalid credentials)
    if (error instanceof AuthError) {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Handle any other unexpected errors
    return Response.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
