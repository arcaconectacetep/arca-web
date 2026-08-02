import { createClient } from "@/lib/supabase/server";
import {
  NotificationCenter,
  type ActivityNotification,
} from "@/components/notifications/notification-center";

export default async function Page() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data } = await db
    .from("notifications")
    .select(
      "id,type,title,body,href,read_at,created_at,actor_id,post_id,comment_id,actor:profiles!notifications_actor_id_fkey(username,full_name,avatar_url),post:posts!notifications_post_id_fkey(title,content)",
    )
    .eq("recipient_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <NotificationCenter
      notifications={(data ?? []) as unknown as ActivityNotification[]}
    />
  );
}
