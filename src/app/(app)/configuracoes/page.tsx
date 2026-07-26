import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/profile/settings-form";
import { PageBack } from "@/components/ui/page-back";
export default async function Page() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data: p } = await db
    .from("profiles")
    .select(
      "id,username,full_name,avatar_url,bio,class_name,shift,theme,color_mode,font_family,high_contrast,reduced_motion,font_scale",
    )
    .eq("id", user!.id)
    .single();
  return (
    <div className="mx-auto max-w-3xl">
      <PageBack />
      <p className="eyebrow">Preferências</p>
      <h1 className="page-title mb-7 mt-2">Configurações</h1>
      {p && <SettingsForm profile={p} />}
    </div>
  );
}
