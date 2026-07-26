import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !publishableKey || !secretKey) {
  throw new Error("Configure URL, publishable key e secret key do Supabase.");
}

const admin = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
const password = `Arca-${randomUUID()}-9a`;
const createdUserIds: string[] = [];
const testStartedAt = new Date().toISOString();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
  console.log(`✓ ${message}`);
}

async function createTestUser(role: "STUDENT" | "STAFF", index: number) {
  const email = `rls.${suffix}.${index}@example.invalid`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Validação temporária RLS" },
  });
  if (error || !data.user) throw error ?? new Error("Falha ao criar usuário temporário.");
  createdUserIds.push(data.user.id);

  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("id")
    .eq("active", true)
    .limit(1)
    .single();
  if (courseError || !course) throw courseError ?? new Error("Nenhum curso ativo.");
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      username: `rls_${suffix}_${index}`.slice(0, 24),
      full_name: "Validação temporária RLS",
      course_id: course.id,
      onboarding_completed: true,
      terms_accepted_at: new Date().toISOString(),
      role,
    })
    .eq("id", data.user.id);
  if (profileError) throw profileError;

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !link.properties.hashed_token)
    throw linkError ?? new Error("Falha ao gerar sessão temporária.");
  const client = createClient(url!, publishableKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: loginError } = await client.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: "magiclink",
  });
  if (loginError) throw loginError;
  return { id: data.user.id, client };
}

async function expectNoRows(
  query: PromiseLike<{ data: unknown[] | null; error: unknown }>,
  message: string,
) {
  const { data, error } = await query;
  assert(!error && data?.length === 0, message);
}

async function run() {
  const studentA = await createTestUser("STUDENT", 1);
  const studentB = await createTestUser("STUDENT", 2);
  const staff = await createTestUser("STAFF", 3);

  const { error: privilegeError } = await studentA.client
    .from("profiles")
    .update({ role: "ADMIN", suspended_at: new Date().toISOString() })
    .eq("id", studentA.id);
  assert(!privilegeError, "Atualização do próprio perfil é processada sem elevar privilégios");
  const { data: protectedProfile } = await admin
    .from("profiles")
    .select("role,suspended_at")
    .eq("id", studentA.id)
    .single();
  assert(
    protectedProfile?.role === "STUDENT" && protectedProfile.suspended_at === null,
    "STUDENT não altera o próprio papel nem sua suspensão",
  );

  const { data: alert, error: alertError } = await studentA.client
    .from("support_alerts")
    .insert({
      author_id: studentA.id,
      category: "OTHER",
      urgency: "GUIDANCE",
      description: "Relato temporário criado exclusivamente para validar as políticas RLS.",
      allow_contact: false,
    })
    .select("id")
    .single();
  if (alertError || !alert) throw alertError ?? new Error("Falha ao criar alerta temporário.");
  const alertId = alert.id;

  const { data: ownAlert } = await studentA.client.from("support_alerts").select("id").eq("id", alertId);
  assert(ownAlert?.length === 1, "Autor visualiza a própria solicitação de suporte");
  await expectNoRows(
    studentB.client.from("support_alerts").select("id").eq("id", alertId),
    "STUDENT não visualiza solicitação de outro estudante",
  );

  const { data: forgedUpdate, error: updateError } = await studentB.client
    .from("support_alerts")
    .update({ status: "RESOLVED" })
    .eq("id", alertId)
    .select("id");
  assert(!updateError && forgedUpdate?.length === 0, "STUDENT não altera status de suporte alheio");

  const { error: noteError } = await studentA.client.from("support_alert_notes").insert({
    alert_id: alertId,
    author_id: studentA.id,
    content: "Nota que deve ser recusada.",
    internal: true,
  });
  assert(Boolean(noteError), "STUDENT não cria nota interna");

  const { data: staffAlert } = await staff.client.from("support_alerts").select("id").eq("id", alertId);
  assert(staffAlert?.length === 1, "STAFF visualiza solicitações de suporte");
  const { error: statusError } = await staff.client
    .from("support_alerts")
    .update({ status: "UNDER_REVIEW", assigned_to: staff.id })
    .eq("id", alertId);
  assert(!statusError, "STAFF atualiza status e responsável");
  const { error: staffNoteError } = await staff.client.from("support_alert_notes").insert({
    alert_id: alertId,
    author_id: staff.id,
    content: "Nota interna temporária da validação.",
    internal: true,
  });
  assert(!staffNoteError, "STAFF cria nota interna");
  await expectNoRows(
    studentA.client.from("support_alert_notes").select("id").eq("alert_id", alertId),
    "Autor do alerta não visualiza notas internas",
  );

  const { error: suspendError } = await admin
    .from("profiles")
    .update({ suspended_at: new Date().toISOString() })
    .eq("id", studentB.id);
  if (suspendError) throw suspendError;
  const { error: postError } = await studentB.client.from("posts").insert({
    author_id: studentB.id,
    content: "Esta publicação deve ser bloqueada.",
    type: "GENERAL",
    section: "FEED",
  });
  assert(Boolean(postError), "Usuário suspenso não cria publicação");
}

async function cleanup() {
  await admin
    .from("notifications")
    .delete()
    .gte("created_at", testStartedAt)
    .in("title", ["Nova solicitação de suporte", "Solicitação atualizada"]);
  for (const id of createdUserIds.reverse()) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error("Falha ao remover uma conta temporária de validação.");
  }
}

async function main() {
  try {
    await run();
    console.log("\nRLS validada com sucesso em um Supabase real.");
  } finally {
    await cleanup();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falha na validação RLS.");
  process.exitCode = 1;
});
