"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  commentSchema,
  loginSchema,
  postSchema,
  profileSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  signupSchema,
  supportSchema,
} from "@/lib/validations";
import type { ActionResult, Role } from "@/types/database";
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
export async function login(form: FormData) {
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
  });
  if (result.error)
    return {
      ok: false,
      error: "E-mail ou senha inválidos.",
    } satisfies ActionResult;
  redirect("/inicio");
}
export async function signUp(form: FormData) {
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
export async function recoverPassword(form: FormData) {
  const parsed = recoverPasswordSchema.safeParse({ email: form.get("email") });
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Informe um e-mail válido.",
    } satisfies ActionResult;
  const db = await createClient();
  await db.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha`,
  });
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
    revalidatePath("/inicio");
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
    revalidatePath("/inicio");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
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
    revalidatePath("/inicio");
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
    revalidatePath("/inicio");
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
    revalidatePath("/inicio");
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
    return { ok: true };
  } catch (e) {
    return { ok: false, error: safe(e) };
  }
}
