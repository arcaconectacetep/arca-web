import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/profile/onboarding-form";
export default async function Page() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: p }, { data: courses }] = await Promise.all([
    db
      .from("profiles")
      .select("full_name,onboarding_completed")
      .eq("id", user.id)
      .single(),
    db.from("courses").select("id,name").eq("active", true).order("name"),
  ]);
  if (p?.onboarding_completed) redirect("/inicio");
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Primeiros passos</p>
      <h1 className="page-title mt-2">Prepare seu espaço.</h1>
      <p className="mb-8 mt-3 text-muted">
        Essas informações ajudam a mostrar conteúdos relevantes para você.
      </p>
      <OnboardingForm courses={courses ?? []} name={p?.full_name ?? ""} />
    </div>
  );
}
