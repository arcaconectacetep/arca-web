"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  commentSchema,
  loginSchema,
  postSchema,
  profileSchema,
  preferenceSettingsSchema,
  publicProfileSettingsSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  signupSchema,
  supportSchema,
} from "@/lib/validations";
import type { ActionResult, Role } from "@/types/database";
import { deleteImageFromImgChest, deletePostFromImgChest, getImgChestImageIdFromUrl } from "@/services/imgchest";
async function context() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("AUTH");
  const { data: profile } = await db
    .from("profiles")
    .select("role,suspended_at")
    .eq("id", user.id)
    .single();
  if (!profile || profile.suspended_at) throw new Error("DENIED");
  return { db, user, role: profile.role as Role };
}
const safe = (e: unknown) =>
  e instanceof Error && e.message === "AUTH"
    ? "Sessão expirada. Entre novamente."
    : e instanceof Error && e.message === "DENIED"
      ? "Acesso não autorizado."
      : "Não foi possível concluir a ação.";

function revalidatePostViews() {
  revalidatePath("/inicio");
  revalidatePath("/espaco");
  revalidatePath("/mural");
  revalidatePath("/tendencias");
  revalidatePath("/publicacao/[id]", "page");
}

async function getUserImgChestPostIds(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const [profileResult, postsResult] = await Promise.all([
    admin
      .from("profiles")
      .select("avatar_imgchest_post_id")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("posts")
      .select("post_images(imgchest_post_id)")
      .eq("author_id", userId),
  ]);
  const ids = new Set<string>();
  if (profileResult.data?.avatar_imgchest_post_id)
    ids.add(profileResult.data.avatar_imgchest_post_id);
  for (const post of postsResult.data ?? [])
    for (const image of post.post_images ?? [])
      if (image.imgchest_post_id) ids.add(image.imgchest_post_id);
  return [...ids];
}

async function cleanupImgChestPosts(postIds: string[]) {
  await Promise.all(
    postIds.map((postId) =>
      deletePostFromImgChest(postId).catch(() => false),
    ),
  );
}
export async function login(form: FormData) {
  const captchaToken = String(form.get("captchaToken") ?? "");
  if (!captchaToken || captchaToken.length > 2048)
    return {
      ok: false,
      error: "Conclua a verificação de segurança.",
    } satisfies ActionResult;
  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Revise os dados informados.",
    } satisfies ActionResult;
  const db = await createClient();
  const result = await db.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { captchaToken },
  });
  if (result.error)
    return {
      ok: false,
      error: "E-mail ou senha inválidos.",
    } satisfies ActionResult;
  redirect("/inicio");
}
export async function signUp(form: FormData) {
  const captchaToken = String(form.get("captchaToken") ?? "");
  if (!captchaToken || captchaToken.length > 2048)
    return {
      ok: false,
      error: "Conclua a verificação de segurança.",
    } satisfies ActionResult;
  const parsed = signupSchema.safeParse({
    fullName: form.get("fullName"),
    email: form.get("email"),
    password: form.get("password"),
    confirmPassword: form.get("confirmPassword"),
    acceptTerms: form.get("acceptTerms") === "on",
  });
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Revise os dados informados.",
    } satisfies ActionResult;
  const db = await createClient();
  const { error } = await db.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      captchaToken,
    },
  });
  return error
    ? {
        ok: false,
        error: "Não foi possível criar a conta. Verifique o e-mail.",
      }
    : ({ ok: true } satisfies ActionResult);
}
export async function logout() {
  const db = await createClient();
  await db.auth.signOut();
  redirect("/");
}
export async function deleteOwnAccount(input: unknown) {
  try {
    const parsed = z.object({
      password: z.string().min(1),
      confirmation: z
        .string()
        .trim()
        .transform((value) => value.toLocaleLowerCase("pt-BR"))
        .refine((value) => value === "excluir minha conta"),
      captchaToken: z.string().min(1).max(2048),
    }).safeParse(input);
    if (!parsed.success) return { ok: false, error: "Revise a frase de confirmação e conclua a verificação de segurança." };
    const { db, user } = await context();
    if (!user.email) return { ok: false, error: "Esta conta não possui um e-mail válido." };
    const { error: passwordError } = await db.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.password,
      options: { captchaToken: parsed.data.captchaToken },
    });
    if (passwordError) {
      const captchaRejected = /captcha|verification|challenge/i.test(passwordError.message);
      return {
        ok: false,
        error: captchaRejected
          ? "A verificação de segurança expirou. Conclua-a novamente."
          : "Senha incorreta.",
      };
    }
    const admin = createAdminClient();
    const imgChestPostIds = await getUserImgChestPostIds(admin, user.id);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { ok: false, error: "Não foi possível excluir a conta. Confirme que as migrations estão atualizadas." };
    await cleanupImgChestPosts(imgChestPostIds);
    await admin.from("audit_logs").insert({ actor_id: null, action: "ACCOUNT_SELF_DELETED", resource_type: "profile", resource_id: user.id, metadata: { self_service: true } });
    await db.auth.signOut();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: safe(error) };
  }
}
export async function recoverPassword(form: FormData) {
  const captchaToken = String(form.get("captchaToken") ?? "");
  if (!captchaToken || captchaToken.length > 2048)
    return {
      ok: false,
      error: "Conclua a verificação de segurança.",
    } satisfies ActionResult;
  const parsed = recoverPasswordSchema.safeParse({ email: form.get("email") });
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Informe um e-mail válido.",
    } satisfies ActionResult;
  const db = await createClient();
  const { error } = await db.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha`,
    captchaToken,
  });
  if (error)
    return {
      ok: false,
      error:
        "Não foi possível validar a solicitação. Refaça a verificação de segurança.",
    } satisfies ActionResult;
  return { ok: true } satisfies ActionResult;
}
export async function updatePassword(form: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    password: form.get("password"),
    confirmPassword: form.get("confirmPassword"),
  });
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Revise a nova senha.",
    } satisfies ActionResult;
  const db = await createClient();
  const { error } = await db.auth.updateUser({
    password: parsed.data.password,
  });
  return error
    ? { ok: false, error: "Não foi possível alterar a senha." }
    : ({ ok: true } satisfies ActionResult);
}
export async function updateProfile(input: unknown) {
  try {
    const { db, user } = await context();
    const data = profileSchema.parse(input);
    const { error } = await db
      .from("profiles")
      .update({
        full_name: data.fullName,
        username: data.username,
        course_id: data.courseId,
        class_name: data.className || null,
        shift: data.shift || null,
        bio: data.bio || null,
        theme: data.theme,
        color_mode: data.colorMode,
        font_family: data.fontFamily,
        high_contrast: data.highContrast,
        reduced_motion: data.reducedMotion,
        font_scale: data.fontScale,
        onboarding_completed: true,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error)
      return {
        ok: false,
        error:
          error.code === "23505"
            ? "Este username já está em uso."
            : "Não foi possível salvar o perfil.",
      };
    revalidatePath("/inicio");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}

export async function updatePublicProfile(input: unknown) {
  try {
    const { db, user } = await context();
    const data = publicProfileSettingsSchema.parse(input);
    const { error } = await db
      .from("profiles")
      .update({
        full_name: data.fullName,
        bio: data.bio || null,
        class_name: data.className || null,
        shift: data.shift || null,
      })
      .eq("id", user.id);
    if (error)
      return { ok: false, error: "Não foi possível atualizar o perfil." };
    revalidatePath("/configuracoes");
    revalidatePath("/perfil/[username]", "page");
    revalidatePath("/inicio");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: safe(error) };
  }
}

export async function updatePreferences(input: unknown) {
  try {
    const { db, user } = await context();
    const data = preferenceSettingsSchema.parse(input);
    const { error } = await db
      .from("profiles")
      .update({
        theme: data.theme,
        color_mode: data.colorMode,
        font_family: data.fontFamily,
        high_contrast: data.highContrast,
        reduced_motion: data.reducedMotion,
        font_scale: data.fontScale,
      })
      .eq("id", user.id);
    if (error) return { ok: false, error: "Não foi possível salvar as preferências." };
    revalidatePath("/configuracoes");
    revalidatePath("/inicio");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: safe(error) };
  }
}

export async function removeAvatar() {
  try {
    const { db, user } = await context();
    const { data: current } = await db.from("profiles").select("avatar_url,avatar_imgchest_post_id").eq("id", user.id).single();
    // A identidade vem da sessao validada acima. A escrita administrativa evita
    // que uma politica RLS desatualizada deixe o botao de remocao inoperante,
    // sem permitir que o cliente escolha qual perfil sera alterado.
    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from("profiles")
      .update({ avatar_url: null, avatar_imgchest_post_id: null })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();
    if (error || !updated)
      return { ok: false, error: "Não foi possível remover a imagem." };
    if (current?.avatar_imgchest_post_id)
      await deletePostFromImgChest(current.avatar_imgchest_post_id).catch(() => false);
    else {
      const imageId = getImgChestImageIdFromUrl(current?.avatar_url);
      if (imageId) await deleteImageFromImgChest(imageId).catch(() => false);
    }
    revalidatePath("/configuracoes");
    revalidatePath("/perfil/[username]", "page");
    revalidatePath("/inicio");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: safe(error) };
  }
}
export async function createPost(input: unknown) {
  try {
    const { db, user, role } = await context();
    const data = postSchema.parse(input);
    if (
      (data.official || data.pinned || data.type === "ANNOUNCEMENT") &&
      role === "STUDENT"
    )
      return { ok: false, error: "Seu papel não permite esta publicação." };
    const { data: post, error } = await db
      .from("posts")
      .insert({
        author_id: user.id,
        title: data.title || null,
        content: data.content,
        type: data.type,
        section: data.section,
        course_id: data.courseId || null,
        official: data.official,
        pinned: data.pinned,
      })
      .select("id")
      .single();
    if (error || !post)
      return { ok: false, error: "Não foi possível publicar." };
    if (data.images.length) {
      const { error: imageError } = await db.from("post_images").insert(
        data.images.map((i, n) => ({
          post_id: post.id,
          image_url: i.imageUrl,
          thumbnail_url: i.thumbnailUrl,
          imgchest_image_id: i.imageId,
          imgchest_post_id: i.postId,
          alt_text: i.altText,
          position: n,
        })),
      );
      if (imageError) {
        await db
          .from("posts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", post.id)
          .eq("author_id", user.id);
        return {
          ok: false,
          error: "Não foi possível vincular as imagens à publicação.",
        };
      }
    }
    revalidatePostViews();
    return { ok: true, data: { id: post.id } };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function updatePost(id: string, input: unknown) {
  try {
    const { db, user, role } = await context();
    const data = postSchema.omit({ images: true }).parse(input);
    const { data: post } = await db
      .from("posts")
      .select("author_id")
      .eq("id", id)
      .single();
    if (
      !post ||
      (post.author_id !== user.id &&
        !(["STAFF", "ADMIN"] as Role[]).includes(role))
    )
      return { ok: false, error: "Sem permissão." };
    if (
      (data.official || data.pinned || data.type === "ANNOUNCEMENT") &&
      role === "STUDENT"
    )
      return { ok: false, error: "Seu papel não permite esta publicação." };
    const { error } = await db
      .from("posts")
      .update({
        title: data.title || null,
        content: data.content,
        type: data.type,
        section: data.section,
        course_id: data.courseId || null,
        official: data.official,
        pinned: data.pinned,
      })
      .eq("id", id);
    if (error) return { ok: false, error: "Não foi possível editar." };
    revalidatePostViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function replacePostImages(postId: string, input: unknown) {
  try {
    const { db, user, role } = await context();
    const id = z.string().uuid().parse(postId);
    const images = postSchema.shape.images.parse(input);
    const { data: post } = await db
      .from("posts")
      .select("author_id,post_images(imgchest_image_id,imgchest_post_id,image_url)")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    const postWithImages = post as
      | {
          author_id: string;
          post_images: Array<{ imgchest_image_id: string | null; imgchest_post_id: string | null; image_url: string }>;
        }
      | null;
    if (
      !postWithImages ||
      (postWithImages.author_id !== user.id &&
        !(role === "STAFF" || role === "ADMIN"))
    )
      return { ok: false, error: "Sem permissão para alterar estas imagens." };

    const { error } = await db.rpc("replace_post_images", {
      p_post_id: id,
      p_images: images,
    });
    if (error)
      return { ok: false, error: "Não foi possível atualizar as imagens." };
    const keptIds = new Set(images.map((image) => image.imageId).filter(Boolean));
    const removedImages = (postWithImages.post_images ?? [])
      .filter((image) => {
        const imageId = image.imgchest_image_id ?? getImgChestImageIdFromUrl(image.image_url);
        return Boolean(imageId) && !keptIds.has(imageId);
      });
    const cleanup = await Promise.all(removedImages.map((image) => image.imgchest_post_id
      ? deletePostFromImgChest(image.imgchest_post_id).catch(() => false)
      : deleteImageFromImgChest(image.imgchest_image_id ?? getImgChestImageIdFromUrl(image.image_url)!).catch(() => false)));
    revalidatePostViews();
    return { ok: true, data: { cleanupWarning: cleanup.some((result) => !result) } };
  } catch (error) {
    return { ok: false, error: safe(error) };
  }
}
export async function deletePost(id: string) {
  try {
    const { db, user } = await context();
    const { data: deleted, error } = await db
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("author_id", user.id)
      .select("id")
      .maybeSingle();
    if (error || !deleted)
      return {
        ok: false,
        error: "Publicação não encontrada ou sem permissão.",
      };
    revalidatePostViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function toggleLike(postId: string) {
  try {
    const { db, user } = await context();
    const { data } = await db
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();
    const result = data
      ? await db
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id)
      : await db
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
    if (result.error) return { ok: false, error: "Não foi possível curtir." };
    revalidatePostViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function createComment(input: unknown) {
  try {
    const { db, user } = await context();
    const d = commentSchema.parse(input);
    const { error } = await db
      .from("comments")
      .insert({ post_id: d.postId, author_id: user.id, content: d.content });
    if (error) return { ok: false, error: "Não foi possível comentar." };
    revalidatePostViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function updateComment(id: string, content: string) {
  try {
    const { db, user } = await context();
    const value = commentSchema.shape.content.parse(content);
    const { error } = await db
      .from("comments")
      .update({ content: value })
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) return { ok: false, error: "Não foi possível editar." };
    revalidatePostViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function deleteComment(id: string) {
  try {
    const { db, user } = await context();
    const { error } = await db
      .from("comments")
      .delete()
      .eq("id", id)
      .eq("author_id", user.id);
    if (!error) revalidatePostViews();
    return error
      ? { ok: false, error: "Não foi possível excluir." }
      : { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function reportPost(
  postId: string,
  reason: string,
  details: string,
) {
  try {
    const { db, user } = await context();
    if (!reason || details.length > 1000)
      return { ok: false, error: "Dados inválidos." };
    const { error } = await db
      .from("post_reports")
      .insert({ post_id: postId, reporter_id: user.id, reason, details });
    return error
      ? {
          ok: false,
          error: "Esta publicação já foi denunciada ou os dados são inválidos.",
        }
      : { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function createSupportAlert(input: unknown) {
  try {
    const { db, user } = await context();
    const d = supportSchema.parse(input);
    const { data, error } = await db
      .from("support_alerts")
      .insert({
        author_id: user.id,
        category: d.category,
        urgency: d.urgency,
        description: d.description,
        location: d.location || null,
        happened_at: d.happenedAt || null,
        allow_contact: d.allowContact,
      })
      .select("id,protocol")
      .single();
    if (error)
      return {
        ok: false,
        error: error.message.includes("Limite")
          ? "Você atingiu o limite de 3 solicitações por hora."
          : "Não foi possível enviar a solicitação.",
      };
    revalidatePath("/suporte");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function updateSupportAlertStatus(
  id: string,
  status: string,
  assignedTo?: string,
) {
  try {
    const { db, user, role } = await context();
    if (!["STAFF", "ADMIN"].includes(role))
      return { ok: false, error: "Sem permissão." };
    const allowed = [
      "RECEIVED",
      "UNDER_REVIEW",
      "CONTACT_ATTEMPTED",
      "FORWARDED",
      "RESOLVED",
      "ARCHIVED",
    ];
    if (!allowed.includes(status))
      return { ok: false, error: "Status inválido." };
    const { data: old } = await db
      .from("support_alerts")
      .select("status,author_id")
      .eq("id", id)
      .single();
    if (!old) return { ok: false, error: "Solicitação não encontrada." };
    const { error: updateError } = await db
      .from("support_alerts")
      .update({
        status,
        assigned_to: assignedTo || null,
        resolved_at: status === "RESOLVED" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (updateError)
      return { ok: false, error: "Não foi possível atualizar a solicitação." };
    await db.from("audit_logs").insert({
      actor_id: user.id,
      action: "SUPPORT_STATUS_UPDATED",
      resource_type: "support_alert",
      resource_id: id,
      metadata: { status },
    });
    revalidatePath("/admin/alertas");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function addSupportAlertNote(id: string, content: string) {
  try {
    const { db, user, role } = await context();
    if (
      !["STAFF", "ADMIN"].includes(role) ||
      !content.trim() ||
      content.length > 3000
    )
      return { ok: false, error: "Dados ou permissão inválidos." };
    const { error } = await db.from("support_alert_notes").insert({
      alert_id: id,
      author_id: user.id,
      content: content.trim(),
      internal: true,
    });
    return error
      ? { ok: false, error: "Não foi possível salvar a nota." }
      : { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
async function adminAction(roleRequired: Role[]) {
  const c = await context();
  if (!roleRequired.includes(c.role)) throw new Error("DENIED");
  return c;
}
export async function updateUserRole(id: string, role: Role) {
  try {
    const { db, user } = await adminAction(["ADMIN"]);
    if (user.id === id)
      return {
        ok: false,
        error: "Use outro administrador para alterar seu próprio papel.",
      };
    if (!["STUDENT", "TEACHER", "STAFF", "ADMIN"].includes(role))
      return { ok: false, error: "Papel inválido." };
    const { data: target } = await db
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();
    if (target?.role === "ADMIN" && role !== "ADMIN") {
      const { count } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "ADMIN")
        .is("suspended_at", null);
      if ((count ?? 0) <= 1)
        return {
          ok: false,
          error: "O sistema precisa manter ao menos um ADMIN ativo.",
        };
    }
    const { data: changed, error: changeError } = await db
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (changeError || !changed)
      return { ok: false, error: "Não foi possível alterar o papel." };
    const { error: auditError } = await db.from("audit_logs").insert({
      actor_id: user.id,
      action: "USER_ROLE_UPDATED",
      resource_type: "profile",
      resource_id: id,
      metadata: { role },
    });
    if (auditError)
      return { ok: false, error: "Papel alterado, mas a auditoria falhou." };
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function suspendUser(id: string) {
  try {
    const { db, user } = await adminAction(["ADMIN"]);
    if (id === user.id)
      return { ok: false, error: "Você não pode suspender a própria conta." };
    const { data: changed, error: changeError } = await db
      .from("profiles")
      .update({ suspended_at: new Date().toISOString() })
      .eq("id", id)
      .neq("role", "ADMIN")
      .select("id")
      .maybeSingle();
    if (changeError || !changed)
      return {
        ok: false,
        error: "Usuário não encontrado ou não pode ser suspenso.",
      };
    const { error: auditError } = await db.from("audit_logs").insert({
      actor_id: user.id,
      action: "USER_SUSPENDED",
      resource_type: "profile",
      resource_id: id,
    });
    if (auditError)
      return { ok: false, error: "Usuário suspenso, mas a auditoria falhou." };
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function restoreUser(id: string) {
  try {
    const { db, user } = await adminAction(["ADMIN"]);
    const { data: changed, error: changeError } = await db
      .from("profiles")
      .update({ suspended_at: null })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (changeError || !changed)
      return { ok: false, error: "Usuário não encontrado." };
    const { error: auditError } = await db.from("audit_logs").insert({
      actor_id: user.id,
      action: "USER_RESTORED",
      resource_type: "profile",
      resource_id: id,
    });
    if (auditError)
      return { ok: false, error: "Usuário reativado, mas a auditoria falhou." };
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function deleteUser(id: string) {
  try {
    const { db, user } = await adminAction(["ADMIN"]);
    if (id === user.id)
      return { ok: false, error: "Você não pode excluir a própria conta." };
    const { data: target } = await db
      .from("profiles")
      .select("role,username")
      .eq("id", id)
      .single();
    if (!target) return { ok: false, error: "Usuário não encontrado." };
    if (target.role === "ADMIN") {
      const { count } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "ADMIN")
        .is("suspended_at", null);
      if ((count ?? 0) <= 1)
        return {
          ok: false,
          error: "O sistema precisa manter ao menos um ADMIN ativo.",
        };
    }
    const admin = createAdminClient();
    const imgChestPostIds = await getUserImgChestPostIds(admin, id);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error)
      return {
        ok: false,
        error:
          "Não foi possível excluir a conta da autenticação. Verifique a migration de exclusão e a SUPABASE_SECRET_KEY.",
      };
    await cleanupImgChestPosts(imgChestPostIds);
    await db.from("audit_logs").insert({
      actor_id: user.id,
      action: "USER_DELETED",
      resource_type: "profile",
      resource_id: id,
      metadata: { username: target.username },
    });
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function hidePost(id: string) {
  try {
    const { db, user } = await adminAction(["STAFF", "ADMIN"]);
    const { data: changed, error: changeError } = await db
      .from("posts")
      .update({ hidden_at: new Date().toISOString(), hidden_by: user.id })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (changeError || !changed)
      return { ok: false, error: "Publicação não encontrada." };
    const { error: auditError } = await db.from("audit_logs").insert({
      actor_id: user.id,
      action: "POST_HIDDEN",
      resource_type: "post",
      resource_id: id,
    });
    if (auditError)
      return {
        ok: false,
        error: "Publicação ocultada, mas a auditoria falhou.",
      };
    revalidatePath("/admin/publicacoes");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function restorePost(id: string) {
  try {
    const { db, user } = await adminAction(["STAFF", "ADMIN"]);
    const { data: changed, error: changeError } = await db
      .from("posts")
      .update({ hidden_at: null, hidden_by: null })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (changeError || !changed)
      return { ok: false, error: "Publicação não encontrada." };
    const { error: auditError } = await db.from("audit_logs").insert({
      actor_id: user.id,
      action: "POST_RESTORED",
      resource_type: "post",
      resource_id: id,
    });
    if (auditError)
      return {
        ok: false,
        error: "Publicação restaurada, mas a auditoria falhou.",
      };
    revalidatePath("/admin/publicacoes");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
export async function markNotificationAsRead(id?: string) {
  try {
    const { db, user } = await context();
    let q = db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", user.id)
      .is("read_at", null);
    if (id) q = q.eq("id", id);
    const { error } = await q;
    if (error)
      return {
        ok: false,
        error: "Não foi possível atualizar as notificações.",
      };
    revalidatePath("/notificacoes");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
