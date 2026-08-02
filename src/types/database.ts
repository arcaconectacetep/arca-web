export type Role = "STUDENT" | "TEACHER" | "STAFF" | "ADMIN";
export type Section = "FEED" | "PEDAGOGICAL" | "WALL" | "TRENDS";
export type PostType =
  | "GENERAL"
  | "ANNOUNCEMENT"
  | "PEDAGOGICAL"
  | "HEALTH"
  | "SAFETY"
  | "OPPORTUNITY"
  | "CULTURE"
  | "ENTREPRENEURSHIP";
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  course_id: string | null;
  class_name: string | null;
  shift: string | null;
  role: Role;
  theme: string;
  high_contrast: boolean;
  reduced_motion: boolean;
  font_scale: number;
  onboarding_completed: boolean;
  suspended_at: string | null;
  created_at: string;
}
export interface Post {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  type: PostType;
  section: Section;
  course_id: string | null;
  pinned: boolean;
  official: boolean;
  created_at: string;
  profiles: Pick<
    Profile,
    "username" | "full_name" | "avatar_url" | "role" | "class_name"
  >;
  post_images: {
    image_url: string;
    thumbnail_url: string | null;
    imgchest_image_id?: string | null;
    imgchest_post_id?: string | null;
    alt_text: string;
    position?: number;
  }[];
  post_likes: { user_id: string }[];
  comments: { id: string }[];
}
export type ActionResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; error: string };
