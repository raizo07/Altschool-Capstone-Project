import { registerSchema } from "@/schemas"; // Import schema for validating registration fields
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { db } from "@/lib/db"; // Import database instance for user data storage
import { getUserByEmail } from "@/services/user-service"; // Import service to check if a user already exists by email
import rateLimitIP from "@/utils/rate-limit"; // Import utility to enforce rate limiting based on IP
import ErrorWithStatus from "@/exception/custom-error"; // Import custom error class to handle errors with status codes

/**
 * Handles the POST request for user registration.
 * Validates input, checks for existing users, hashes the password, and stores the new user in the database.
 * Implements rate limiting and proper error handling for various failure scenarios.
 *
 * @param {Request} request - The incoming HTTP request object.
 * @returns {Promise<Response>} - The response containing the result of the registration operation.
 */
export async function POST(request: Request) {
  try {
    // Apply rate limiting based on IP to prevent abuse
    await rateLimitIP(request);

    // Parse and validate the request body using the registration schema
    const body = await request.json();
    const validatedFields = registerSchema.safeParse(body);
    if (!validatedFields.success) {
      // Throw a custom error if validation fails
      throw new ErrorWithStatus("Invalid fields", 400);
    }

    // Destructure validated name, email, and password from the request body
    const { name, email, password } = validatedFields.data;

    // Hash the user's password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if a user with the provided email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) throw new ErrorWithStatus("Email already in use", 409);

    // Create a new user record in the database with the hashed password
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Return a successful response indicating that registration was successful
    return Response.json(
      { success: true, message: "Registration successful" },
      { status: 201 },
    );
  } catch (error) {
    // Handle custom errors with status codes
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    // Handle any other unexpected errors
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
