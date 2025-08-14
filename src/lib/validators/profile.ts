// src/lib/validators/profile.ts
import { z } from "zod";

export const RESERVED_HANDLES = new Set([
  "admin","root","owner","support","help","contact","about","pricing","price",
  "privacy","terms","tos","api","auth","signin","signup","logout","user","users",
  "me","profile","dashboard","wait-list","waitlist","settings","_","www"
]);

export function normalizeHandle(raw: string) {
  const s = raw.toLowerCase()
    .replace(/[^a-z0-9._]+/g, "")
    .replace(/[._]{2,}/g, ".")
    .replace(/^[._]+|[._]+$/g, "");
  return s;
}

export function handleFromFullName(name: string) {
  const base = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/[.]{2,}/g, ".")
    .replace(/^[.]+|[.]+$/g, "");
  return base.slice(0, 30) || "user";
}

export const handleRegex = /^(?!.*[._]{2})[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])?$/;

const UrlStr = z.string().trim().url().max(2048);

// Reusable handle schema: normalize -> then validate length/regex
const HandleSchema = z.string().trim()
  .transform(normalizeHandle)
  .pipe(
    z.string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        handleRegex,
        "Username can use letters, numbers, dot or underscore; no leading/trailing separators."
      )
  );

export const ProfileCreateSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(60),
  handle: HandleSchema,
  bio: z.string().trim().max(280, "Bio must be at most 280 characters").optional().or(z.literal("")) ,
  image: UrlStr.optional(),
});

export const ProfileUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(60).optional(),
  handle: HandleSchema.optional(),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  image: UrlStr.optional(),
}).refine((v) => Object.keys(v).length > 0, {
  message: "No fields to update",
});

export type ProfileCreateInput = z.infer<typeof ProfileCreateSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
