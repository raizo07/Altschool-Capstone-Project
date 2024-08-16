import * as z from "zod"; // Import Zod for schema validation

// Regular expression to validate URLs, supporting various protocols and formats
const urlRegex =
  /^((?:ftp|http|https)?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

/**
 * Schema for validating login fields.
 * Ensures that both email and password are provided, with email being in a valid format.
 */
export const loginSchema = z.object({
  email: z.string().email({ message: "Email is required" }), // Validates the presence and format of the email
  password: z.string().min(1, { message: "Password is required" }), // Ensures the password is provided
});

/**
 * Schema for validating registration fields.
 * Includes additional validation to ensure that the confirmed password matches the original password.
 */
export const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }), // Validates that a name is provided
    email: z.string().email({ message: "Email is required" }), // Validates the presence and format of the email
    password: z.string().min(1, { message: "Password is required" }), // Ensures the password is provided
    confirmPassword: z.string().min(1, { message: "Password is required" }), // Ensures the confirmation password is provided
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match", // Custom error message if passwords do not match
    path: ["confirmPassword"], // Targets the confirmPassword field in the error message
  });

/**
 * Schema for validating link shortening requests.
 * Validates the link format and optionally checks the length and format of a custom suffix.
 */
export const shortenLinkSchema = z.object({
  name: z.string().max(10, { message: "Name is too long" }).optional(), // Optional name field with a maximum length of 10 characters
  link: z.string().regex(urlRegex, { message: "Invalid URL" }), // Ensures the link matches the URL regex pattern
  customSuffix: z
    .string()
    .min(3, { message: "Custom suffix is too short" }) // Validates that custom suffix is at least 3 characters long
    .optional() // Makes the custom suffix optional
    .or(z.undefined()), // Allows for the custom suffix to be undefined
});

/**
 * Schema for validating requests to change a custom suffix.
 * Ensures that the new custom suffix meets the minimum length requirement.
 */
export const changeCustomSuffixSchema = z.object({
  customSuffix: z.string().min(3, { message: "Custom suffix is too short" }), // Validates that the custom suffix is at least 3 characters long
});
