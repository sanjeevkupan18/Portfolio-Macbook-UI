import { z } from "zod";

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 5000;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Name is too long (max 100 characters)."),
  email: z.string().trim().min(1, "Please enter your email.").max(254, "Email is too long.").pipe(z.email("Please enter a valid email address.")),
  subject: z.string().trim().max(150, "Subject is too long (max 150 characters).").optional().default(""),
  message: z
    .string()
    .trim()
    .min(1, "Please write a message.")
    .min(MESSAGE_MIN, `Message must be at least ${MESSAGE_MIN} characters.`)
    .max(MESSAGE_MAX, `Message is too long (max ${MESSAGE_MAX} characters).`),
  /** Honeypot: real users never fill this in. */
  company: z.string().max(0).optional().default(""),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email.")),
  password: z.string().min(1, "Enter your password.").max(200),
});

export const messageStatusSchema = z.object({ status: z.enum(["unread", "read", "archived"]) });

export const unlockSchema = z.object({ password: z.string().max(200) });

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
