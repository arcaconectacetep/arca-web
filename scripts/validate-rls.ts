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

async function createTestUser(
  role: "STUDENT" | "TEACHER" | "STAFF" | "ADMIN",
  index: number,
) {
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
  const teacher = await createTestUser("TEACHER", 3);
  const staff = await createTestUser("STAFF", 4);
  const testAdmin = await createTestUser("ADMIN", 5);

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

  const { data: studentPost, error: studentPostError } = await studentA.client
    .from("posts")
    .insert({
      author_id: studentB.id,
      content: "Publicação temporária para validar interações e autoria protegida.",
      type: "GENERAL",
      section: "FEED",
    })
    .select("id,author_id")
    .single();
  if (studentPostError || !studentPost)
    throw studentPostError ?? new Error("Falha ao criar publicação temporária.");
  assert(studentPost.author_id === studentA.id, "Banco força a autoria da publicação para o usuário autenticado");

  const { error: officialError } = await studentA.client.from("posts").insert({
    author_id: studentA.id,
    content: "Comunicado indevido.",
    type: "ANNOUNCEMENT",
    section: "FEED",
    official: true,
  });
  assert(Boolean(officialError), "STUDENT não cria comunicado oficial");

  const { data: teacherPost, error: teacherPostError } = await teacher.client
    .from("posts")
    .insert({
      author_id: teacher.id,
      content: "Comunicado pedagógico temporário autorizado.",
      type: "ANNOUNCEMENT",
      section: "PEDAGOGICAL",
      official: true,
    })
    .select("id")
    .single();
  assert(!teacherPostError && Boolean(teacherPost), "TEACHER cria comunicado pedagógico autorizado");

  const { error: forgedLikeError } = await studentB.client.from("post_likes").insert({
    post_id: studentPost.id,
    user_id: studentA.id,
  });
  assert(Boolean(forgedLikeError), "STUDENT não registra curtida em nome de outro usuário");
  const { error: likeError } = await studentB.client.from("post_likes").insert({
    post_id: studentPost.id,
    user_id: studentB.id,
  });
  assert(!likeError, "STUDENT curte publicação visível");

  const { data: comment, error: commentError } = await studentB.client
    .from("comments")
    .insert({
      post_id: studentPost.id,
      author_id: studentA.id,
      content: "Comentário temporário para a validação.",
    })
    .select("id,author_id")
    .single();
  assert(!commentError && comment?.author_id === studentB.id, "Banco força autoria correta do comentário");

  const { data: socialNotifications, error: socialNotificationError } = await studentA.client
    .from("notifications")
    .select("id,type,recipient_id")
    .in("type", ["LIKE", "COMMENT"]);
  assert(
    !socialNotificationError &&
      socialNotifications?.some((item) => item.type === "LIKE") &&
      socialNotifications.some((item) => item.type === "COMMENT") &&
      socialNotifications.every((item) => item.recipient_id === studentA.id),
    "Curtida e comentário geram notificações somente para o autor",
  );
  const notificationId = socialNotifications?.[0]?.id;
  if (!notificationId) throw new Error("Notificação temporária não encontrada.");
  const { error: notificationUpdateError } = await studentA.client
    .from("notifications")
    .update({ read_at: new Date().toISOString(), title: "Título adulterado" })
    .eq("id", notificationId);
  if (notificationUpdateError) throw notificationUpdateError;
  const { data: protectedNotification } = await admin
    .from("notifications")
    .select("title,read_at")
    .eq("id", notificationId)
    .single();
  assert(
    protectedNotification?.title !== "Título adulterado" && protectedNotification?.read_at !== null,
    "Usuário marca como lida sem adulterar o conteúdo da notificação",
  );

  const media = [{
    imageUrl: "https://cdn.imgchest.com/files/rls-validation-image.webp",
    thumbnailUrl: "https://cdn.imgchest.com/files/rls-validation-thumb.webp",
    imageId: `rls-${suffix}`,
    altText: "Imagem fictícia usada apenas na validação das políticas.",
  }];
  const { error: mediaError } = await studentA.client.rpc("replace_post_images", {
    p_post_id: studentPost.id,
    p_images: media,
  });
  assert(!mediaError, "Autor gerencia associações de mídia da própria publicação atomicamente");
  const { error: foreignMediaError } = await studentB.client.rpc("replace_post_images", {
    p_post_id: studentPost.id,
    p_images: [],
  });
  assert(Boolean(foreignMediaError), "Outro STUDENT não altera mídia da publicação");

  const { data: alert, error: alertError } = await studentA.client
    .from("support_alerts")
    .insert({
      author_id: studentA.id,
      category: "OTHER",
      urgency: "GUIDANCE",
      description: "Relato temporário criado exclusivamente para validar as políticas RLS.",
      allow_contact: false,
    })
    .select("id,protocol")
    .single();
  if (alertError || !alert) throw alertError ?? new Error("Falha ao criar alerta temporário.");
  const alertId = alert.id;
  assert(/^ARCA-\d{4}-\d{6}$/.test(alert.protocol), "Novas solicitações recebem protocolo com identidade ARCA");

  const { data: ownAlert } = await studentA.client.from("support_alerts").select("id").eq("id", alertId);
  assert(ownAlert?.length === 1, "Autor visualiza a própria solicitação de suporte");
  await expectNoRows(
    studentB.client.from("support_alerts").select("id").eq("id", alertId),
    "STUDENT não visualiza solicitação de outro estudante",
  );
  await expectNoRows(
    teacher.client.from("support_alerts").select("id").eq("id", alertId),
    "TEACHER não acessa solicitações privadas de suporte",
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
  const { data: statusEvents } = await staff.client
    .from("support_alert_events")
    .select("id,new_status")
    .eq("alert_id", alertId)
    .eq("new_status", "UNDER_REVIEW");
  const { data: supportNotification } = await studentA.client
    .from("notifications")
    .select("id,body")
    .eq("type", "SUPPORT_UPDATE")
    .eq("href", `/suporte/${alertId}`);
  assert(
    statusEvents?.length === 1 && supportNotification?.length === 1 &&
      !supportNotification[0]?.body.includes("UNDER_REVIEW"),
    "Mudança de status cria evento e notificação genérica na mesma operação",
  );
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

  for (let index = 2; index <= 3; index += 1) {
    const { error } = await studentA.client.from("support_alerts").insert({
      author_id: studentA.id,
      category: "OTHER",
      urgency: "GUIDANCE",
      description: `Solicitação temporária número ${index} para validar o limite por hora.`,
      allow_contact: false,
    });
    if (error) throw error;
  }
  const { error: rateLimitError } = await studentA.client.from("support_alerts").insert({
    author_id: studentA.id,
    category: "OTHER",
    urgency: "GUIDANCE",
    description: "Quarta solicitação temporária que deve ser recusada pelo limite por hora.",
    allow_contact: false,
  });
  assert(Boolean(rateLimitError), "Canal limita cada usuário a três solicitações por hora");

  const { error: auditInsertError } = await staff.client.from("audit_logs").insert({
    actor_id: staff.id,
    action: "RLS_VALIDATION",
    resource_type: "profiles",
    resource_id: studentA.id,
    metadata: { temporary: true },
  });
  assert(!auditInsertError, "STAFF registra ação administrativa no audit log");
  await expectNoRows(
    studentA.client.from("audit_logs").select("id").eq("action", "RLS_VALIDATION"),
    "STUDENT não visualiza audit logs",
  );
  const { data: adminAudit } = await testAdmin.client
    .from("audit_logs")
    .select("id")
    .eq("action", "RLS_VALIDATION")
    .eq("actor_id", staff.id);
  assert(adminAudit?.length === 1, "ADMIN visualiza audit logs");

  const { error: hideError } = await staff.client
    .from("posts")
    .update({ hidden_at: new Date().toISOString(), hidden_by: staff.id })
    .eq("id", studentPost.id);
  assert(!hideError, "STAFF modera publicação de terceiro");
  await expectNoRows(
    studentB.client.from("posts").select("id").eq("id", studentPost.id),
    "Publicação ocultada deixa de ser visível para outro STUDENT",
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
