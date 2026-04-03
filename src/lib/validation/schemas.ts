import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      "Username must be lowercase alphanumeric (hyphens allowed, not at start/end)"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(64, "Display name must be at most 64 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createScriptSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(128, "Slug too long")
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  description: z.string().max(2000).optional(),
  content: z
    .string()
    .min(1, "Script content is required")
    .max(1_000_000, "Script too large (max 1MB)"),
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
});

export const updateScriptSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/)
    .optional(),
  description: z.string().max(2000).optional(),
  content: z.string().min(1).max(1_000_000).optional(),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
});

// Reserved subdomains that cannot be used as usernames
export const RESERVED_USERNAMES = new Set([
  "www",
  "api",
  "app",
  "admin",
  "panel",
  "mail",
  "smtp",
  "ftp",
  "ssh",
  "ns1",
  "ns2",
  "cdn",
  "static",
  "assets",
  "help",
  "support",
  "status",
  "blog",
  "docs",
]);
