import { z } from "zod";
export const postSchema = z.object({
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().min(1).max(5000),
  type: z.enum([
    "GENERAL",
    "ANNOUNCEMENT",
    "PEDAGOGICAL",
    "HEALTH",
    "SAFETY",
    "OPPORTUNITY",
    "CULTURE",
    "ENTREPRENEURSHIP",
  ]),
  section: z.enum(["FEED", "PEDAGOGICAL", "WALL", "TRENDS"]),
  courseId: z.string().uuid().optional().or(z.literal("")),
  official: z.boolean().default(false),
  pinned: z.boolean().default(false),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        imageId: z.string().optional(),
        altText: z.string().max(200),
      }),
    )
    .max(4)
    .default([]),
});
export const commentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().trim().min(1).max(1000),
});
export const supportSchema = z.object({
  category: z.enum([
    "BULLYING",
    "CYBERBULLYING",
    "PREJUDICE",
    "DISCRIMINATION",
    "HARASSMENT",
    "THREAT",
    "ACCESSIBILITY",
    "EMOTIONAL_SUPPORT",
    "OTHER",
  ]),
  urgency: z.enum(["GUIDANCE", "ATTENTION", "URGENT"]),
  description: z.string().trim().min(20).max(5000),
  location: z.string().trim().max(200).optional(),
  happenedAt: z.string().optional(),
  allowContact: z.boolean(),
});
export const profileSchema = z.object({
  fullName: z.string().trim().min(3).max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._]{3,24}$/),
  courseId: z.string().uuid(),
  className: z.string().trim().max(50).optional(),
  shift: z.string().trim().max(30).optional(),
  bio: z.string().trim().max(500).optional(),
  theme: z.enum(["DEFAULT", "BLUE", "AURORA", "NEUTRAL"]),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  fontScale: z.union([z.literal(1), z.literal(1.15), z.literal(1.3)]),
  termsAccepted: z.literal(true),
});
